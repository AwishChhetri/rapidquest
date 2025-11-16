
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = "SUPER_SECRET_KEY"; 
const MONGO_URI =
  "mongodb+srv://abishchhetri2502_db_user:wRsWh70LcFo9eqRC@cluster0.1vbk07a.mongodb.net/?appName=Cluster0";
const GEMINI_API_KEY = "AIzaSyAmgsYN81ZWukHrwulF6l7MGlTTAS6BdvI";


mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["admin", "manager", "marketer"], default: "marketer" },
  department: String,
  teams: [String],
  telegramChatId: String,
  connectToken: String,
  createdAt: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);

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


function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token");
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


const normalize = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .replace(/[-_.,/\\#@!$%^&*;:{}=\-`~()"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function wordOverlapScore(text, query) {
  const tWords = new Set(normalize(text).split(/\s+/));
  const qWords = normalize(query).split(/\s+/);
  let hits = 0;
  for (const w of qWords) if (tWords.has(w)) hits++;
  return hits / Math.max(qWords.length, 1);
}

function levenshtein(a = "", b = "") {
  a = a || "";
  b = b || "";
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyTokenMatch(text, query) {
  // produce a small extra score for near-matches of short tokens (e.g., "excel" vs "exel")
  const qTokens = normalize(query).split(/\s+/).filter(Boolean);
  const tTokens = normalize(text).split(/\s+/).filter(Boolean);
  let score = 0;
  for (const q of qTokens) {
    for (const t of tTokens) {
      if (q === t) { score += 1; break; }
      if (Math.min(q.length, t.length) <= 6) {
        const d = levenshtein(q, t);
        if (d <= 1) { score += 0.8; break; }
        if (d <= 2) { score += 0.4; break; }
      }
    }
  }
  return score / Math.max(qTokens.length, 1);
}

function rankDocs(docs, query) {
  const q = normalize(query);
  return docs
    .map((d) => {
      const nameScore = wordOverlapScore(d.name || "", q) * 2;
      const topicScore = wordOverlapScore(d.topic || "", q) * 1.8;
      const tagScore = (d.tags || []).map(t => wordOverlapScore(t, q)).reduce((a,b)=>a+b,0);
      const summaryScore = wordOverlapScore(d.summary || "", q) * 1.2;
      const fuzzy = fuzzyTokenMatch(`${d.name} ${d.topic} ${d.tags?.join(" ")}`, q);
      // small boost if query word appears as substring
      const substrBoost = (normalize(d.name + " " + d.summary + " " + (d.tags||[]).join(" ")).includes(q) ? 1.5 : 0);
      const score = nameScore + topicScore + tagScore + summaryScore + fuzzy + substrBoost;
      return { doc: d, score };
    })
    .sort((a, b) => b.score - a.score);
}

// compact helper to build minimal context (top-K) for Gemini to save tokens
function buildContext(topDocs, maxDocs = 5) {
  const docs = topDocs.slice(0, maxDocs).map((d) => {
    return `File: ${d.doc.name}
Topic: ${d.doc.topic || "N/A"}
Team: ${d.doc.team || "N/A"}
Tags: ${(d.doc.tags || []).join(", ")}
Summary: ${d.doc.summary || ""}
URL: ${d.doc.cloudinaryUrl || ""}`;
  });
  return docs.join("\n\n");
}


app.get("/", (req, res) => {
  res.send("🚀 Backend Running (Intelligent chat) — /register /login /me /save-file /files /chat /generate-telegram-token /save-telegram-chat");
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, department, teams } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email+password required" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "User exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const connectToken = "TLG-" + crypto.randomBytes(8).toString("hex");

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      department,
      teams,
      connectToken,
    });

    res.json({ success: true, user });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        department: user.department,
        teams: user.teams,
      },
      JWT_SECRET
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ME
app.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to load user" });
  }
});

// SAVE TELEGRAM CHAT (from frontend if user pastes chat id)
app.post("/save-telegram-chat", auth, async (req, res) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ error: "chatId required" });
    await User.findByIdAndUpdate(req.user.id, { telegramChatId: String(chatId) });
    res.json({ success: true });
  } catch (err) {
    console.error("save-telegram-chat error:", err);
    res.status(500).json({ error: "Failed to save" });
  }
});

// GENERATE TELEGRAM CONNECT TOKEN (frontend calls this; token saved in user)
app.post("/generate-telegram-token", auth, async (req, res) => {
  try {
    const newToken = "TLG-" + crypto.randomBytes(8).toString("hex");
    await User.findByIdAndUpdate(req.user.id, { connectToken: newToken });
    res.json({ success: true, token: newToken });
  } catch (err) {
    console.error("generate token error:", err);
    res.status(500).json({ success: false, error: "Could not generate token" });
  }
});

// SAVE FILE: receives metadata + cloudinary url; downloads file, sends to Gemini for metadata extraction and stores file
app.post("/save-file", auth, async (req, res) => {
  try {
    const { name, type, size, cloudinaryUrl } = req.body;
    if (!name || !type || !cloudinaryUrl) return res.status(400).json({ error: "Missing required fields" });

    const fileResp = await axios.get(cloudinaryUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(fileResp.data);

    // Ask Gemini to extract topic/team/tags/summary (compact prompt)
    const aiResponse = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: type,
                data: buffer.toString("base64"),
              },
            },
            {
              text: `Analyze the file and return a compact JSON only with this shape:
{"topic":"one-word","team":"one-word","tags":["t1","t2"],"summary":"3-4 short sentences"}`
            }
          ],
        },
      ],
    });

    const aiText = aiResponse.response.text().trim();
    // extract first JSON object substring
    const jsonStart = aiText.indexOf("{");
    const jsonEnd = aiText.lastIndexOf("}") + 1;
    if (jsonStart === -1 || jsonEnd === -1) {
      console.warn("AI did not return JSON; using fallback minimal values");
    }
    const extracted = jsonStart !== -1 ? aiText.slice(jsonStart, jsonEnd) : "{}";
    const parsed = JSON.parse(extracted || "{}");

    const saved = await FileModel.create({
      name,
      type,
      size,
      cloudinaryUrl,
      uploadedBy: req.user.id,
      department: req.user.department,
      team: parsed.team || req.user.teams?.[0] || "General",
      topic: parsed.topic || "general",
      tags: parsed.tags || [],
      summary: parsed.summary || "",
    });

    res.json({ success: true, file: saved });
  } catch (err) {
    console.error("save-file error:", err);
    res.status(500).json({ error: "Failed to save file", details: err.message });
  }
});

// GET FILES WITH RBAC
app.get("/files", auth, async (req, res) => {
  try {
    const user = req.user;
    let query = {};
    if (user.role === "admin") query = {};
    else if (user.role === "manager") query = { department: user.department };
    else query = { $or: [{ uploadedBy: user.id }, { team: { $in: user.teams } }] };

    const files = await FileModel.find(query).sort({ createdAt: -1 });
    res.json({ success: true, files });
  } catch (err) {
    console.error("files error:", err);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

app.post("/chat", auth, async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "question required" });

    // 1) Resolve RBAC and gather candidate docs
    const user = req.user;
    let queryCond = {};
    if (user.role === "admin") queryCond = {};
    else if (user.role === "manager") queryCond = { department: user.department };
    else queryCond = { $or: [{ uploadedBy: user.id }, { team: { $in: user.teams } }] };

    const docs = await FileModel.find(queryCond).lean();

    if (!docs || docs.length === 0) {
      return res.json({ success: true, answer: "No files available for your account." });
    }

    // 2) Rank docs locally
    const ranked = rankDocs(docs, question);
    const top = ranked.filter(r => r.score > 0).slice(0, 10);

    // 3) Detect a "send file" intent (very simple pattern)
    const qNorm = normalize(question);
    const wantsFileUrl = /\bsend .*file\b|\bsend .*url\b|\bshare .*file\b|\bget .*file\b|\bdownload\b/.test(qNorm);

    if (wantsFileUrl) {
      if (top.length === 0) return res.json({ success: true, answer: "No matching files found." });
      // if multiple matches, return top URLs (max 3)
      const urls = top.slice(0, 3).map(t => t.doc.cloudinaryUrl).filter(Boolean);
      if (urls.length === 0) return res.json({ success: true, answer: "No file URLs available." });
      // if user explicitly asked for a single file by name, try exact best match
      return res.json({ success: true, answer: urls.length === 1 ? urls[0] : urls.join("\n") });
    }

    // 4) build compact context of top documents (limit to 5)
    const context = buildContext(top, 5);

    // 5) Send to Gemini with concise prompt optimized for tokens
    const prompt = `
You are a concise assistant. Use ONLY the information provided below from the user's documents.
Be brief (use at most 60-90 words), mention filenames when relevant.

DOCUMENTS:
${context}

USER QUESTION:
${question}

If nothing relevant: reply "No matching files found."
If multiple documents are relevant: produce a short combined answer and list the filenames matched.
Answer in simple English.
`;

    const aiRes = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const answer = aiRes.response.text().trim();
    // Return answer
    res.json({ success: true, answer });
  } catch (err) {
    console.error("Chat Error:", err);
    res.status(500).json({ success: false, answer: "Chat system failed." });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
