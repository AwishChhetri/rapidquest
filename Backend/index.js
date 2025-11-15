import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

// -------------------------------
// CONFIG
// -------------------------------
const PORT = 3000;
const JWT_SECRET = "SUPER_SECRET_KEY"; // replace in production

const MONGO_URI = "mongodb+srv://abishchhetri2502_db_user:wRsWh70LcFo9eqRC@cluster0.1vbk07a.mongodb.net/?appName=Cluster0";
const GEMINI_API_KEY = "AIzaSyCuaEcD_hYtMWs0XiN6JM8dG2xbCA3P1r0";

// -------------------------------
// CONNECT MONGO
// -------------------------------
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));


// -------------------------------
// MODELS
// -------------------------------

// USER
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin", "manager", "marketer"], default: "marketer" },
  department: String,
  teams: [String],
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

// FILE
const fileSchema = new mongoose.Schema({
  name: String,
  type: String,
  size: String,
  cloudinaryUrl: String,

  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  department: String,
  team: String,

  topic: String,
  tags: [String],
  summary: String,

  createdAt: { type: Date, default: Date.now },
});
const FileModel = mongoose.model("File", fileSchema);


// -------------------------------
// AUTH MIDDLEWARE
// -------------------------------
function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}


// -------------------------------
// GEMINI
// -------------------------------
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


// -------------------------------
// ROUTES
// -------------------------------

app.get("/", (req, res) => {
  res.send("🚀 Backend Running with RBAC + Gemini AI");
});


// REGISTER USER
app.post("/register", async (req, res) => {
  const { name, email, password, role, department, teams } = req.body;

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    department,
    teams
  });

  res.json({ success: true, user });
});


// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({
    id: user._id,
    role: user.role,
    department: user.department,
    teams: user.teams
  }, JWT_SECRET);

  res.json({ success: true, token, user });
});


// -------------------------------
// SAVE FILE
// -------------------------------
app.post("/save-file",auth, async (req, res) => {
  try {
    console.log("📥 Incoming request → /save-file");
    console.log("📝 Body:", req.body);

    const { name, type, size, cloudinaryUrl } = req.body;

    const user = req.user;
    console.log("👤 Authenticated User:", user);

    if (!name || !type || !cloudinaryUrl) {
      console.log("❌ Missing fields in request body");
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ----------------------------------------
    // 1️⃣ DOWNLOAD FILE FROM CLOUDINARY
    // ----------------------------------------
    console.log("⬇️ Downloading file from Cloudinary:", cloudinaryUrl);

    const fileResp = await axios.get(cloudinaryUrl, {
      responseType: "arraybuffer",
    });

    console.log("📦 File downloaded. Size(bytes):", fileResp.data?.length || "N/A");

    const fileBuffer = Buffer.from(fileResp.data);

    // ----------------------------------------
    // 2️⃣ SEND FILE TO GEMINI
    // ----------------------------------------
    console.log("🤖 Sending file to Gemini...");

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
Analyze and return ONLY:

{
  "topic": "one word",
  "team": "one word",
  "tags": ["tag1", "tag2", "tag3"],
  "summary": "3-4 sentences"
}
`
            }
          ],
        },
      ],
    });

    console.log("🧠 Raw Gemini response received.");

    const aiText = aiResponse.response.text().trim();
    console.log("🔍 Gemini Output Text:", aiText);

    // ----------------------------------------
    // 3️⃣ PARSE AI JSON
    // ----------------------------------------
    console.log("🔎 Parsing AI JSON...");

    const jsonStart = aiText.indexOf("{");
    const jsonEnd = aiText.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === -1) {
      console.log("❌ No JSON found in AI response.");
      throw new Error("Gemini returned invalid JSON.");
    }

    const extractedJSON = aiText.slice(jsonStart, jsonEnd);
    console.log("📄 Extracted JSON:", extractedJSON);

    const parsed = JSON.parse(extractedJSON);

    console.log("✅ Parsed AI JSON:", parsed);

    // ----------------------------------------
    // 4️⃣ SAVE FILE TO MONGO
    // ----------------------------------------
    console.log("💾 Saving file to MongoDB...");

    const saved = await FileModel.create({
      name,
      type,
      size,
      cloudinaryUrl,

      uploadedBy: user.id,
      department: user.department,
      team: user.teams?.[0] || "General",

      topic: parsed.topic,
      tags: parsed.tags,
      summary: parsed.summary,
    });

    console.log("🎉 File saved successfully:", saved._id);

    return res.json({
      success: true,
      file: saved,
    });

  } catch (err) {
    console.log("❌ ERROR in /save-file:", err);
    return res.status(500).json({
      error: "AI pipeline failed",
      details: err.message,
    });
  }
});



// GET FILES BASED ON ROLE
app.get("/files", auth, async (req, res) => {
  const user = req.user;

  let query = {};

  if (user.role === "admin") query = {};
  else if (user.role === "manager") query = { department: user.department };
  else if (user.role === "marketer") {
    query = {
      $or: [
        { uploadedBy: user.id },
        { team: { $in: user.teams } }
      ]
    };
  }

  const files = await FileModel.find(query).sort({ createdAt: -1 });

  res.json({ success: true, files });
});
app.post("/chat", auth, async (req, res) => {
  try {
    const { question } = req.body;
    const user = req.user;

    // 1. Fetch relevant user documents
    let query = {};
    if (user.role === "admin") query = {};
    else if (user.role === "manager") query = { department: user.department };
    else query = { $or: [{ uploadedBy: user.id }, { team: { $in: user.teams } }] };

    const docs = await FileModel.find(query);

    // Build knowledge dataset
    const context = docs.map((d) => {
      return `
File Name: ${d.name}
Topic: ${d.topic}
Team: ${d.team}
Tags: ${d.tags.join(", ")}
Summary: ${d.summary}
Download URL: ${d.cloudinaryUrl}
`;
    }).join("\n\n");

    // 2. Ask Gemini with improved prompt
    const aiRes = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `
You are a helpful assistant. You answer based ONLY on the following documents:

${context}

User question: ${question}

Rules:
- If a relevant file exists, mention its filename.
- If user asks “send me the file”, return ONLY the file's Cloudinary URL.
- If multiple files match, summarize all.
- If nothing matches, say: "No matching files found."
- Answer clearly in simple conversational English.
`
        }]
      }]
    });

    const answer = aiRes.response.text().trim();

    res.json({ success: true, answer });

  } catch (err) {
    console.log("Chat Error:", err);
    res.status(500).json({ success: false, answer: "Chat system failed." });
  }
});



// -------------------------------
// START
// -------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
