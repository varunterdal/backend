const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_FILE = './db.json';

// Load DB
function loadDB() {
    return JSON.parse(fs.readFileSync(DB_FILE));
}

// Save DB
function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ----------------- USERS -----------------

// Signup
app.post('/signup', (req, res) => {
    const { email, password } = req.body;
    if (!email.endsWith('@kletech.ac.in')) return res.status(400).json({ message: 'Email must end with @kletech.ac.in' });
    if (!password || password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const db = loadDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ message: 'User already exists' });

    db.users.push({ email, password });
    saveDB(db);
    res.json({ message: 'Signup successful' });
});

// Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = loadDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ message: 'Login successful' });
});

// ----------------- BLOGS -----------------

// Get all blogs
app.get('/blogs', (req, res) => {
    const db = loadDB();
    res.json(db.blogs);
});

// Add blog
app.post('/blogs', (req, res) => {
    const { title, content, author } = req.body;
    if (!title || !content || !author) return res.status(400).json({ message: 'All fields required' });

    const db = loadDB();
    const blog = { id: Date.now(), title, content, author, date: new Date().toISOString() };
    db.blogs.push(blog);
    saveDB(db);
    res.json({ message: 'Blog added', blog });
});

// Delete blog
app.delete('/blogs/:id', (req, res) => {
    const db = loadDB();
    const id = parseInt(req.params.id);
    db.blogs = db.blogs.filter(blog => blog.id !== id);
    saveDB(db);
    res.json({ message: 'Blog deleted' });
});

app.listen(5000, () => console.log('Backend running at http://localhost:5000'));
