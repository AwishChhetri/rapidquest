'use client'

import { useState } from 'react'
import { Send, X, MessageSquare } from 'lucide-react'

export default function ChatPanel({ showChat, setShowChat }) {
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! I\'m your AI assistant. Ask me anything about your documents.' },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return

    setMessages([...messages, { id: messages.length + 1, type: 'user', text: input }])

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: 'bot',
          text: 'I found some relevant documents. Would you like me to analyze them?',
        },
      ])
    }, 500)

    setInput('')
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          backgroundColor: '#007bff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          zIndex: 40,
          boxShadow: '0 4px 12px rgba(0,123,255,0.4)'
        }}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Panel */}
      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '30px',
          width: '350px',
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          height: '400px',
          zIndex: 40
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '16px' }}>AI Assistant</h3>
            <button
              onClick={() => setShowChat(false)}
              style={{ padding: '5px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: message.type === 'user' ? '#007bff' : '#f0f0f0',
                    color: message.type === 'user' ? 'white' : '#333',
                    fontSize: '13px',
                    lineHeight: '1.4'
                  }}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid #eee' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '12px'
              }}
            />
            <button
              onClick={handleSend}
              style={{
                padding: '8px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
