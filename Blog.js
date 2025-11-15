app.post("/blogs", async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content || !author) {
      return res.status(400).json({ message: "All fields required" });
    }

    const blog = await new Blog({ title, content, author }).save();
    res.json({ message: "Blog added", blog });
  } catch (err) {
    console.error("Add blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
