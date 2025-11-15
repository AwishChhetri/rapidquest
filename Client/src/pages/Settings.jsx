'use client'

import { useState } from 'react'
import { MessageSquare, Save, Eye, EyeOff, Lock } from 'lucide-react'

export default function Settings() {
  const [showToken, setShowToken] = useState(false)
  const [settings, setSettings] = useState({
    telegramBotToken: 'your-bot-token-here',
    telegramChatId: '123456789',
    autoSync: true,
    notifications: true,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = () => {
    alert('Settings saved successfully!')
  }

  return (
    <div
      style={{
        flex: 1,
        height: '100vh',         
        overflowY: 'auto',         
        backgroundColor: '#fafafa'
      }}
    >
      <div style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
        
        <div
          style={{
            marginBottom: '30px',
            padding: '30px',
            border: '1px solid #ddd',
            borderRadius: '12px',
            background: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
              Settings
            </h1>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Manage your application settings
            </p>
          </div>
          <Lock size={60} color="#999" />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <MessageSquare size={30} color="#007bff" />
            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
              Telegram Bot Configuration
            </h2>
          </div>

          <div
            style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            
            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                Bot Token
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showToken ? 'text' : 'password'}
                  name="telegramBotToken"
                  value={settings.telegramBotToken}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    paddingRight: '40px'
                  }}
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                Get your token from @BotFather
              </p>
            </div>

            <div>
              <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                Chat ID
              </label>
              <input
                type="text"
                name="telegramChatId"
                value={settings.telegramChatId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }}
              />
              <p style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                The chat ID for notifications
              </p>
            </div>

            <button
              style={{
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Test Connection
            </button>

          </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
            General Settings
          </h2>

          <div
            style={{
              padding: '20px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              background: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>Auto Sync</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  Automatically sync documents
                </p>
              </div>
              <input
                type="checkbox"
                name="autoSync"
                checked={settings.autoSync}
                onChange={handleChange}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #eee',
                paddingTop: '15px'
              }}
            >
              <div>
                <p style={{ fontWeight: 'bold' }}>Notifications</p>
                <p style={{ fontSize: '12px', color: '#666' }}>
                  Receive desktop alerts
                </p>
              </div>
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleChange}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </div>

          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          <Save size={20} />
          Save Settings
        </button>

      </div>
    </div>
  )
}
