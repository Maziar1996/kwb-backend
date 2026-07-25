const mongoose = require("mongoose");
require("dotenv").config();

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sections: { type: Array, default: [] },
  },
  { timestamps: true },
);

const Page = mongoose.model("Page", pageSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    await Page.deleteMany({});
    console.log("Cleared existing pages");

    const data = require("./db.json");
    const pages = data.pages.map(({ title, slug, sections }) => ({
      title,
      slug,
      sections,
    }));

    await Page.insertMany(pages);
    console.log(`Inserted ${pages.length} pages successfully`);

    mongoose.disconnect();
  } catch (err) {
    console.error("Seed error:", err);
    mongoose.disconnect();
  }
}

seed();
