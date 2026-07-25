const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// اتصال به MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sections: { type: Array, default: [] },
  },
  { timestamps: true },
);

// این کار باعث میشه _id به صورت id هم برگردونده بشه
pageSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    return ret;
  },
});

const Page = mongoose.model("Page", pageSchema);

// Routes

// گرفتن همه صفحات - پشتیبانی از ?slug=home
app.get("/pages", async (req, res) => {
  try {
    const filter = req.query.slug ? { slug: req.query.slug } : {};
    const pages = await Page.find(filter);
    res.json(pages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// گرفتن یه صفحه با slug
app.get("/pages/slug/:slug", async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// گرفتن یه صفحه با id
app.get("/pages/:id", async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ساخت صفحه جدید
app.post("/pages", async (req, res) => {
  try {
    const page = new Page(req.body);
    await page.save();
    res.status(201).json(page);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// آپدیت صفحه با id
app.put("/pages/:id", async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json(page);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// حذف صفحه
app.delete("/pages/:id", async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({ message: "Page deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
