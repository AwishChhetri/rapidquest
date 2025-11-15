import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import FileUpload from './pages/FileUpload'
import Settings from './pages/Settings'
import Auth from './pages/Auth'
import Landing from './pages/Landing'

function App() {
  const [page, setPage] = useState("landing")   // landing → auth → dashboard
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Auto-login from localStorage
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setPage("dashboard")
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setUser(null)
    setPage("auth")
  }

  // ----------------------
  // PUBLIC PAGES
  // ----------------------
  if (page === "landing") {
    return <Landing setPage={setPage} />
  }

  if (page === "auth") {
    return <Auth setPage={setPage} setUser={setUser} />
  }

  // ----------------------
  // PROTECTED PAGES
  // If no user, force redirect.
  // ----------------------
  if (!user) {
    return <Auth setPage={setPage} setUser={setUser} />
  }

  return (
    <div className="flex h-screen bg-background text-foreground">

      <Sidebar 
        currentPage={page} 
        setCurrentPage={setPage} 
        logout={logout}
      />

      <div className="flex-1 overflow-hidden">
        {page === 'dashboard' && <Dashboard user={user} />}
        {page === 'upload' && <FileUpload user={user} />}
        {page === 'settings' && <Settings user={user} />}
      </div>
    </div>
  )
}

export default App
