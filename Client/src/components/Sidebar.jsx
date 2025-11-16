'use client'

import { LayoutDashboard, Upload, Settings, LogOut, Sparkles, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar({ currentPage, setCurrentPage, logout }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 flex flex-col h-screen">
      
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">DocHub</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          const isHovered = hoveredItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`
                w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg 
                transition-all duration-200 font-medium text-sm
                ${isActive 
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
                ${isHovered && !isActive ? 'translate-x-1' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} />
                <span>{item.label}</span>
              </div>

              {isActive && <ChevronRight size={18} />}
            </button>
          )
        })}
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-all duration-200 font-medium text-sm"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  )
}
