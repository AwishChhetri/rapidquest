'use client'

import { useEffect, useState } from 'react'
import { Save, Eye, EyeOff, Lock, MessageSquare, Copy, CheckCircle, AlertCircle } from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const [settings, setSettings] = useState({
    telegramConnectToken: "",
    telegramChatId: "",
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("https://rapidquest-unzo.onrender.com/me", {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        if (data?.user) {
          setSettings({
            telegramConnectToken: data.user.telegramConnectToken || "",
            telegramChatId: data.user.telegramChatId || "",
          })
        }
      } catch (err) {
        console.log("Error fetching settings:", err)
      }
      setLoading(false)
    }

    loadData()
  }, [token])

  const generateToken = async () => {
    try {
      const res = await fetch("https://rapidquest-unzo.onrender.com/generate-telegram-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      const data = await res.json()

      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          telegramConnectToken: data.token
        }))
        setSaveStatus('Token generated!')
        setTimeout(() => setSaveStatus(''), 3000)
      }

    } catch (err) {
      console.error("Failed to generate token:", err)
    }
  }

  const saveChatId = async () => {
    try {
      await fetch("https://rapidquest-unzo.onrender.com/save-telegram-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telegramChatId: settings.telegramChatId,
        }),
      })

      setSaveStatus('Chat ID saved successfully!')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (err) {
      console.error("Error saving:", err)
      setSaveStatus('Error saving settings')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-300">Loading settings...</p>
      </div>
    </div>
  )

  return (
    <div className="h-screen overflow-y-scroll bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Lock size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-gray-400 ml-12">Manage your Telegram integration</p>
        </div>

        {/* STATUS MESSAGE */}
        {saveStatus && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-900 border border-emerald-500 flex items-center gap-2">
            <CheckCircle size={20} className="text-emerald-400" />
            <p className="text-emerald-100">{saveStatus}</p>
          </div>
        )}

        {/* TELEGRAM SECTION */}
        <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border border-slate-600 overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 border-b border-slate-600">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <MessageSquare size={24} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-white">Telegram Bot Integration</h2>
                <p className="text-indigo-100 text-sm">t.me/FileStationAI_bot</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">

            {/* TOKEN SECTION */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-white font-semibold mb-2 block">Connect Token</span>

                <p className="text-gray-400 text-sm mb-3">
                  How to connect:
                  <br />1. Generate a new token.
                  <br />
                  2. Open Telegram →
                  <a
                    href="https://t.me/FileStationAI_bot"
                    target="_blank"
                    className="text-indigo-300 underline ml-1"
                  >
                    @FileStationAI_bot
                  </a>
                  <br />3. Send: <code className="text-indigo-400">/connect YOUR_TOKEN</code>
                  <br />4. Your chat will link automatically.
                </p>
              </label>

              <div className="space-y-3">
                <div className="relative group">
                  <input
                    type={showToken ? "text" : "password"}
                    value={settings.telegramConnectToken || ""}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 pr-14 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />

                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-indigo-400 transition"
                  >
                    {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(settings.telegramConnectToken)}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-gray-200 font-medium py-2 px-4 rounded-lg transition"
                >
                  <Copy size={16} />
                  {copied ? 'Copied!' : 'Copy Token'}
                </button>
              </div>

              <button
                onClick={generateToken}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 transform hover:scale-105"
              >
                Generate New Token
              </button>
            </div>

            {/* DIVIDER */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

            {/* CHAT ID SECTION */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-white font-semibold mb-2 block">Linked Telegram Chat ID</span>
                <p className="text-gray-400 text-sm mb-3">This appears after a successful connection.</p>
              </label>

              <input
                type="text"
                value={settings.telegramChatId || ""}
                readOnly
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />

              <button
                onClick={saveChatId}
                disabled={!!settings.telegramChatId}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition duration-200 transform flex items-center justify-center gap-2 ${
                  settings.telegramChatId
                    ? "bg-emerald-700 cursor-default text-white"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white hover:scale-105"
                }`}
              >
                <Save size={18} />
                {settings.telegramChatId ? "Telegram Connected" : "Save Chat ID"}
              </button>
            </div>
          </div>
        </div>

        {/* INFO CARD */}
        <div className="mt-8 p-4 rounded-lg bg-slate-700 border border-slate-600 flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-gray-300 text-sm">Your Telegram integration is secure and encrypted.</p>
        </div>
      </div>
    </div>
  )
}
