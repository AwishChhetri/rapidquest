
# 📁 FileStation — AI-Powered Document Hub

FileStation is a smart document management system with **AI tagging, summaries, search, preview**, and a **Telegram AI assistant** that lets you chat with your files.

---

## 🚀 Features

* Upload documents → AI auto-extracts **topic**, **team**, **tags**, **summary**
* Search & filter by name, tags, topics, or teams
* File preview (PDF, images, text)
* Built-in AI chat inside dashboard
* Telegram bot integration (`/connect <token>`)
* Role-based access (Admin / Manager / Marketer)

---

## 🛠️ Tech Stack

* **Frontend**: React, Tailwind
* **Backend**: Node.js, Express, MongoDB
* **AI**: Gemini 2.5 Flash
* **Bot**: Node Telegram Bot API
* **Auth**: JWT

---

## 📦 Setup

### Backend (3000)

```
cd backend
npm install
npm start
```

### Bot Server (3002)

```
cd backend
npm install
node FilestationAI_bot.js
```

### Frontend

```
cd Client
npm install
npm run dev
```

---

## 🤖 Connect Telegram

1. Go to **Settings → Generate Telegram Token**
2. Open your bot
3. Send:

   ```
   /connect TLG-xxxx
   ```

---

## 📂 Upload Flow

1. User uploads a file
2. Backend fetches from Cloudinary
3. Gemini extracts metadata
4. File saved to MongoDB
5. Appears instantly on dashboard

---


## 🧑‍💻 Project Structure

```
backend/
frontend/
```

---

