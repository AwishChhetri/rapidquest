'use client'

import { useState } from 'react'
import axios from 'axios'
import { Upload, X, CheckCircle, File, Cloud, AlertCircle } from 'lucide-react'

export default function FileUpload() {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)

  // Cloudinary
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/da7eitibw/auto/upload"
  const UPLOAD_PRESET = "Document_management"

  // AUTH (GET TOKEN + USER)
  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null

  const user = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user"))
    : null

  // DRAG HANDLERS
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === "dragenter" || e.type === "dragover")
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    uploadFiles(Array.from(e.dataTransfer.files))
  }

  const handleChange = (e) => {
    uploadFiles(Array.from(e.target.files))
  }

  // UPLOAD FUNCTION
  const uploadFiles = async (selectedFiles) => {
    if (!token) {
      alert("You are not logged in!")
      return
    }

    for (let file of selectedFiles) {
      const tempId = Math.random()

      setFiles(prev => [
        ...prev,
        {
          id: tempId,
          name: file.name,
          size: file.size,
          progress: 5,
          status: "uploading",
          url: null,
          type: file.type
        }
      ])

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET)

      try {
        const cloudRes = await axios.post(CLOUDINARY_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => {
            const progress = Math.round((p.loaded * 100) / p.total)
            setFiles(prev =>
              prev.map(f => (f.id === tempId ? { ...f, progress } : f))
            )
          }
        })

        const data = cloudRes.data

        // Update UI - upload complete
        setFiles(prev =>
          prev.map(f =>
            f.id === tempId
              ? { ...f, status: "completed", progress: 100, url: data.secure_url }
              : f
          )
        )

        // Send metadata to backend with JWT
        const payload = {
          name: file.name,
          type: file.type,
          size: file.size,
          cloudinaryUrl: data.secure_url,
        }

        await axios.post(
          "https://rapidquest-unzo.onrender.com/save-file",
          payload,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

      } catch (err) {
        console.log("UPLOAD ERROR:", err)
        setFiles(prev =>
          prev.map(f =>
            f.id === tempId
              ? { ...f, status: "error", progress: 0 }
              : f
          )
        )
      }
    }
  }

  // REMOVE FILE
  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  // FORMAT SIZE
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('word')) return '📋'
    if (type.includes('sheet')) return '📊'
    return '📎'
  }

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Upload Documents
              </h1>
              <p className="text-base text-slate-600 font-medium">
                Upload your files for AI-powered analysis and management
              </p>
            </div>
            <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100">
              <Cloud size={32} className="text-indigo-600" />
            </div>
          </div>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative group mb-8 p-8 md:p-16 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-200/50'
              : 'border-dashed border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30 shadow-sm hover:shadow-md'
          }`}
        >
          <input 
            type="file" 
            multiple 
            id="file-input"
            onChange={handleChange} 
            className="hidden" 
          />

          <label 
            htmlFor="file-input" 
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <div className={`mb-4 p-4 rounded-full transition-all duration-300 ${
              dragActive 
                ? 'bg-indigo-200 scale-110' 
                : 'bg-slate-100 group-hover:bg-indigo-100'
            }`}>
              <Upload 
                size={48} 
                className={`transition-colors duration-300 ${
                  dragActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'
                }`} 
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2 text-center">
              {dragActive ? 'Drop your files here' : 'Drag & drop your files'}
            </h2>
            
            <p className="text-slate-500 mb-4 text-center">
              or{' '}
              <span className="font-semibold text-indigo-600 group-hover:text-indigo-700">
                click to browse
              </span>
            </p>

            <p className="text-sm text-slate-400 text-center">
              PDF, Word, Excel, PowerPoint, Images and more
            </p>
          </label>
        </div>

        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-blue-600 rounded-full"></div>
              Uploaded Files ({files.length})
            </h2>

            <div className="space-y-3">
              {files.map((file, idx) => (
                <div 
                  key={file.id}
                  className="group flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-blue-50 border border-slate-200 hover:border-indigo-200 transition-all duration-300"
                >
                  <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 text-3xl mt-1 md:mt-0">
                      {getFileIcon(file.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-sm md:text-base">
                        {file.name}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500 mt-1">
                        {formatFileSize(file.size)}
                      </p>

                      {file.status === "uploading" && (
                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 rounded-full"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      {file.status === "completed" ? (
                        <span className="flex items-center gap-1 text-green-600 font-medium text-sm">
                          <CheckCircle size={18} className="flex-shrink-0" />
                          <span className="hidden sm:inline">Done</span>
                        </span>
                      ) : file.status === "error" ? (
                        <span className="flex items-center gap-1 text-red-600 font-medium text-sm">
                          <AlertCircle size={18} className="flex-shrink-0" />
                          <span className="hidden sm:inline">Failed</span>
                        </span>
                      ) : (
                        <span className="text-indigo-600 font-medium text-sm animate-pulse">
                          {file.progress}%
                        </span>
                      )}
                    </div>

                    {file.url && (
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                      >
                        View
                      </a>
                    )}

                    <button 
                      onClick={() => removeFile(file.id)}
                      className="flex-shrink-0 p-1.5 hover:bg-red-100 text-slate-400 hover:text-red-600 rounded-lg transition-all duration-200"
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Files</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{files.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Completed</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {files.filter(f => f.status === 'completed').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Uploading</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {files.filter(f => f.status === 'uploading').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Size</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">
                    {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {files.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">
              No files uploaded yet. Start by dragging files above or clicking to browse.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
