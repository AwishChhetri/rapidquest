import dotenv from "dotenv";
dotenv.config();

import express from "express";
import TelegramBot from "node-telegram-bot-api";
import axios from "axios";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

// ----------------------------------------
// CONFIG
// ----------------------------------------
const BOT_TOKEN = process.env.BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL;
const MONGO_URI = process.env.MONGO_URI;

const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.BOT_PORT || 3002;

// ----------------------------------------
// EXPRESS SERVER TO KEEP BOT ALIVE
// ----------------------------------------
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🤖 Telegram Bot Server Running");
});

app.listen(PORT, () => {
  console.log(`🚀 Telegram Bot Server at http://localhost:${PORT}`);
});

// ----------------------------------------
// CONNECT MONGO
// ----------------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("📦 Bot Connected to MongoDB"))
  .catch((err) => console.log("❌ Bot DB Error:", err));

// ----------------------------------------
// MODELS
// ----------------------------------------
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  department: String,
  teams: [String],
  telegramChatId: String,
  connectToken: String,
});
const User = mongoose.model("User", UserSchema);

// ----------------------------------------
// JWT for backend chat
// ----------------------------------------
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department,
      teams: user.teams,
    },
    JWT_SECRET
  );
};

// Sessions map
const sessions = {};

// ----------------------------------------
// START TELEGRAM BOT
// ----------------------------------------
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("🤖 Telegram Bot Started Successfully");

// ----------------------------------------
// /start command
// ----------------------------------------
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `Welcome to FileStation AI 🤖📂

To link your web account:

1. Open Dashboard → Settings  
2. Copy your *Telegram Connect Token*  
3. Paste here:

/connect TOKEN

Example:
/connect TLG-91b2eaa01fdce2b1`
  );
});

// ----------------------------------------
// /connect TOKEN
// ----------------------------------------
bot.onText(/\/connect (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const token = match[1].trim();

  try {
    const user = await User.findOne({ connectToken: token });

    if (!user) {
      return bot.sendMessage(chatId, "❌ Invalid token. Please copy again from your Settings.");
    }

    // Save Telegram Chat ID
    user.telegramChatId = String(chatId);
    await user.save();

    // Store local session
    sessions[chatId] = {
      token: generateToken(user),
      user,
    };

    bot.sendMessage(
      chatId,
      `✅ *Account linked successfully!*

Hello ${user.name}!  
You can now ask me anything about your files.`,
      { parse_mode: "Markdown" }
    );
  } catch (err) {
    console.log("❌ Connect Error:", err);
    bot.sendMessage(chatId, "⚠️ Failed to connect your Telegram.");
  }
});

// ----------------------------------------
// MAIN CHAT
// ----------------------------------------
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands
  if (text.startsWith("/")) return;

  // Not connected
  if (!sessions[chatId]) {
    return bot.sendMessage(chatId, "⚠️ Not connected.\nUse /connect TOKEN first.");
  }

  const { token } = sessions[chatId];

  try {
    const response = await axios.post(
      `${BACKEND_URL}/chat`,
      { question: text },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    bot.sendMessage(chatId, response.data.answer, {
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.log("❌ Chat Error:", err);
    bot.sendMessage(chatId, "⚠️ Error chatting with your documents.");
  }
});
