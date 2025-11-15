
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----------------- MONGODB -----------------
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set in environment variables.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ----------------- SCHEMAS & MODELS -----------------
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Blog = mongoose.model('Blog', blogSchema);

// ----------------- ROUTES -----------------

// Root / health check
app.get('/', (req, res) => {
  res.send('Backend is running successfully with MongoDB!');
});

// ----------------- USERS -----------------

// Signup
app.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.endsWith('@kletech.ac.in')) {
      return res.status(400).json({ message: 'Email must end with @kletech.ac.in' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password });
    await user.save();

    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Signup error:', err);
    // handle duplicate key error more gracefully
    if (err.code === 11000) return res.status(400).json({ message: 'User already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------- BLOGS -----------------

// Get all blogs
app.get('/blogs', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.json(blogs);
  } catch (err) {
    console.error('Get blogs error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add blog
app.post('/blogs', async (req, res) => {
  try {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const blog = new Blog({ title, content, author, date: new Date() });
    await blog.save();

    res.json({ message: 'Blog added', blog });
  } catch (err) {
    console.error('Add blog error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete blog
app.delete('/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    console.error('Delete blog error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ----------------- SERVER -----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));


