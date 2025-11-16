'use client'

import { useEffect, useState } from 'react'
import { Save, Eye, EyeOff, Lock, MessageSquare } from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(true)
  const [showToken, setShowToken] = useState(false)

  const [settings, setSettings] = useState({
    telegramConnectToken: "",
    telegramChatId: "",
  })

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // -------------------------------
  // Load User Settings
  // -------------------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("http://localhost:3000/me", {
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

  // -------------------------------
  // Generate new connect-token
  // -------------------------------
  const generateToken = async () => {
    try {
      const res = await fetch("http://localhost:3000/generate-telegram-token", {
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
      }

    } catch (err) {
      alert("Failed to generate token.")
    }
  }

  // -------------------------------
  // SAVE Telegram Chat ID
  // -------------------------------
  const saveChatId = async () => {
    try {
      await fetch("http://localhost:3000/save-telegram-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          telegramChatId: settings.telegramChatId,
        }),
      })

      alert("Saved successfully!")
    } catch (err) {
      alert("Error saving.")
    }
  }

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>

  return (
    <div style={{ flex: 1, height: "100vh", overflowY: "auto", background: "#fafafa" }}>
      <div style={{ padding: 30, maxWidth: 600, margin: "0 auto" }}>

        {/* HEADER */}
        <div
          style={{
            marginBottom: 30,
            padding: 30,
            background: "white",
            borderRadius: 12,
            border: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, fontWeight: "bold" }}>Settings</h1>
            <p style={{ color: "#666" }}>Telegram integration</p>
          </div>
          <Lock size={60} color="#999" />
        </div>

        {/* TELEGRAM SECTION */}
        <div style={{ marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 20 }}>
            <MessageSquare size={30} color="#007bff" />
            <h2 style={{ fontWeight: "bold", fontSize: 20 }}>Telegram Bot Link</h2>
          </div>

          <div
            style={{
              padding: 20,
              background: "white",
              borderRadius: 8,
              border: "1px solid #ddd",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* TOKEN SECTION */}
            <div>
              <label style={{ fontWeight: "bold", marginBottom: 6, display: "block" }}>
                Connect Token
              </label>

              <div style={{ position: "relative" }}>
                <input
                  type={showToken ? "text" : "password"}
                  value={settings.telegramConnectToken || ""}
                  readOnly
                  style={{
                    width: "100%",
                    padding: 10,
                    fontFamily: "monospace",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    paddingRight: 40,
                  }}
                />

                <button
                  onClick={() => setShowToken(!showToken)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                onClick={generateToken}
                style={{
                  marginTop: 10,
                  padding: "10px 15px",
                  background: "#6c63ff",
                  color: "white",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Generate New Token
              </button>

              <p style={{ fontSize: 12, color: "#666", marginTop: 5 }}>
                Paste this token in Telegram using: /connect TOKEN
              </p>
            </div>

            {/* CHAT ID SECTION */}
            <div>
              <label style={{ fontWeight: "bold", marginBottom: 6, display: "block" }}>
                Linked Telegram Chat ID
              </label>
              <input
                type="text"
                value={settings.telegramChatId || ""}
                readOnly
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontFamily: "monospace",
                }}
              />

              <button
                onClick={saveChatId}
                style={{
                  marginTop: 10,
                  padding: "10px 15px",
                  background: "#28a745",
                  color: "white",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Chat ID
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
