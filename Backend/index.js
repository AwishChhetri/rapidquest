import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());



const PORT = 5000;
const MONGO_URI = "mongodb+srv://abishchhetri2502_db_user:wRsWh70LcFo9eqRC@cluster0.1vbk07a.mongodb.net/?appName=Cluster0";



mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ------------------------
// FILE MODEL
// ------------------------

const fileSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: String,
  topic: String,
  team: String,
  tags: [String],
  cloudinaryUrl: String, // URL provided by frontend
  createdAt: { type: Date, default: Date.now },
});

const FileModel = mongoose.model("File", fileSchema);

// ------------------------
// SAVE FILE METADATA ONLY
// ------------------------
app.get("/",(req,res)=>{
    res.send("Demo")
    console.log("This is the server!")
})
app.post("/save-file", async (req, res) => {
  try {
    console.log(req.body)
    const { name, type, size, topic, team, tags, cloudinaryUrl } = req.body;

    // Validate
    if (!name || !cloudinaryUrl) {
      return res.status(400).json({ error: "Name and cloudinaryUrl required" });
    }

    const saved = await FileModel.create({
      name,
      type,
      size,
      topic,
      team,
      tags,
      cloudinaryUrl,
    });

    return res.json({ success: true, file: saved });

  } catch (err) {
    console.log("SAVE ERROR:", err);
    return res.status(500).json({ success: false, error: "Could not save file" });
  }
});

// ------------------------
// GET ALL FILES
// ------------------------

app.get("/files", async (req, res) => {
  try {
    const files = await FileModel.find().sort({ createdAt: -1 });
    return res.json({ success: true, files });
  } catch (err) {
    console.log("FETCH ERROR:", err);
    return res.status(500).json({ success: false, error: "Could not fetch files" });
  }
});

// ------------------------
// START SERVER
// ------------------------

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
