import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import FileUpload from './pages/FileUpload'
import Settings from './pages/Settings'


function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex-1 overflow-hidden">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'upload' && <FileUpload />}
        {currentPage === 'settings' && <Settings />}
      </div>
    </div>
  )
}

export default App
