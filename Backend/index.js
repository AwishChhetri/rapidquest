import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

// ------------------------------------
// DIRECT VARIABLES (no dotenv)
// ------------------------------------
const PORT = 3000;

const MONGO_URI =
  "mongodb+srv://abishchhetri2502_db_user:wRsWh70LcFo9eqRC@cluster0.1vbk07a.mongodb.net/?appName=Cluster0";

const GEMINI_API_KEY =
  "AIzaSyCKjuHRTI3DW7yVXGGSa2b_vr3wETjaKq0"; // <-- your Gemini Key

// ------------------------------------
// VALIDATION
// ------------------------------------
if (!MONGO_URI) {
  console.error("❌ MONGO_URI missing.");
  process.exit(1);
}
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing.");
  process.exit(1);
}

// ------------------------------------
// CONNECT TO MONGO
// ------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// ------------------------------------
// FILE MODEL
// ------------------------------------
const fileSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: String,
  cloudinaryUrl: String,
  topic: String,
  team: String,
  tags: [String],
  summary: String,
  createdAt: { type: Date, default: Date.now },
});

const FileModel = mongoose.model("File", fileSchema);

// ------------------------------------
// BASIC ROUTE
// ------------------------------------
app.get("/", (req, res) => {
  res.send("🚀 Backend Running with Gemini File AI 🎯");
});

// ------------------------------------
// GEMINI CLIENT
// ------------------------------------
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// ------------------------------------
// SAVE FILE + AI ANALYSIS
// ------------------------------------
app.post("/save-file", async (req, res) => {
  try {
    console.log("➡️ Incoming File Metadata:", req.body);

    const { name, type, size, cloudinaryUrl } = req.body;

    if (!name || !cloudinaryUrl || !type) {
      return res
        .status(400)
        .json({ error: "name, type, cloudinaryUrl required" });
    }

    // 1️⃣ DOWNLOAD FILE FROM CLOUDINARY
    console.log("⬇️ Downloading file from Cloudinary…");

    const fileResponse = await axios.get(cloudinaryUrl, {
      responseType: "arraybuffer",
    });

    const fileBuffer = Buffer.from(fileResponse.data);
    console.log("📥 File downloaded:", fileBuffer.length, "bytes");

    // 2️⃣ SEND FILE TO GEMINI
    console.log("🤖 Sending to Gemini…");

    const aiResponse = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: type,
                data: fileBuffer.toString("base64"),
              },
            },
            {
              text: `
Analyze this file and return JSON only:

{
  "topic": "one word",
  "team": "one word",
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "3–4 sentence summary"
}

No extra text. Only JSON.
`,
            },
          ],
        },
      ],
    });

    const aiText = aiResponse.response.text().trim();
    console.log("🧠 Raw Gemini Output:", aiText);

    // 3️⃣ PARSE JSON
    let topic = "General";
    let team = "Unassigned";
    let tags = [];
    let summary = "No summary available.";

    try {
      const jsonStart = aiText.indexOf("{");
      const jsonEnd = aiText.lastIndexOf("}") + 1;

      const parsed = JSON.parse(aiText.slice(jsonStart, jsonEnd));

      topic = parsed.topic || topic;
      team = parsed.team || team;
      tags = parsed.tags || tags;
      summary = parsed.summary || summary;
    } catch (err) {
      console.log("⚠️ Failed to parse AI JSON:", err);
    }

    // 4️⃣ SAVE TO DB
    console.log("💾 Saving document…");

    const saved = await FileModel.create({
      name,
      type,
      size,
      cloudinaryUrl,
      topic,
      team,
      tags,
      summary,
    });

    res.json({
      success: true,
      file: saved,
      ai: { topic, team, tags, summary },
    });
  } catch (err) {
    console.log("❌ SERVER ERROR:", err);
    res.status(500).json({
      success: false,
      error: "AI Pipeline Failed",
      details: err?.message,
    });
  }
});

// ------------------------------------
// GET ALL FILES
// ------------------------------------
app.get("/files", async (req, res) => {
  try {
    const files = await FileModel.find().sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (err) {
    console.log("❌ Fetch Error:", err);
    res.status(500).json({ success: false, error: "Cannot fetch files" });
  }
});

// ------------------------------------
// START SERVER
// ------------------------------------
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
