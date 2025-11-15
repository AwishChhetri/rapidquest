'use client'

import { LayoutDashboard, Upload, Settings, LogOut, Sparkles } from 'lucide-react'

export default function Sidebar({ currentPage, setCurrentPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div style={{ 
      width: '250px', 
      borderRight: '1px solid #ccc', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      padding: '0' 
    }}>
      {/* Logo */}
      <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: '#007bff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={22} color="white" />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>DocHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#007bff' : 'transparent',
                color: isActive ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: isActive ? 'bold' : 'normal'
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '10px', borderTop: '1px solid #eee' }}>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: 'transparent',
          color: '#666',
          cursor: 'pointer',
        }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
