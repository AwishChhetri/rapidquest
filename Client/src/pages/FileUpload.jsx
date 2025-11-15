'use client'

import { useState } from 'react'
import axios from 'axios'
import { Upload, X, CheckCircle, File } from 'lucide-react'

export default function FileUpload() {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/da7eitibw/auto/upload"
  const UPLOAD_PRESET = "Document_management"

  // ------------------ DRAG HANDLERS ------------------
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

  // ------------------ MAIN UPLOAD FUNCTION ------------------
  const uploadFiles = async (selectedFiles) => {
    for (let file of selectedFiles) {
      const tempId = Math.random()

      // step 1: update UI immediately
      setFiles(prev => [
        ...prev,
        {
          id: tempId,
          name: file.name,
          size: file.size,
          progress: 5,
          status: "uploading",
          url: null
        }
      ])

      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", UPLOAD_PRESET)

      console.log("Uploading to Cloudinary…")

      try {
        const res = await axios.post(CLOUDINARY_URL, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (p) => {
            const progress = Math.round((p.loaded * 100) / p.total)
            setFiles(prev =>
              prev.map(f => f.id === tempId ? { ...f, progress } : f)
            )
          }
        })

        const data = res.data
        console.log("Cloudinary Response:", data)

        // update UI upload success
        setFiles(prev =>
          prev.map(f =>
            f.id === tempId
              ? { ...f, status: "completed", progress: 100, url: data.secure_url }
              : f
          )
        )

        // ------------------------------
        // STEP 2: send ONLY metadata to backend
        // ------------------------------

        const payload = {
          name: file.name,
          type: file.type,
          size: file.size,
          cloudinaryUrl: data.secure_url
        }

        console.log("Sending to backend:", payload)

        const apiRes = await axios.post("http://localhost:3000/save-file", payload)
        console.log("Backend response:", apiRes.data)

      } catch (err) {
        console.log("UPLOAD ERROR:", err)
      }
    }
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes"
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i]
  }

  return (
    <div style={{ flex: 1, overflow: "auto" }}>
      <div style={{ padding: "30px" }}>

        {/* HEADER */}
        <div style={{
          marginBottom: "30px",
          padding: "30px",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between"
        }}>
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: "bold" }}>Upload Files</h1>
            <p style={{ fontSize: "14px", color: "#666" }}>Upload documents to manage them</p>
          </div>
          <Upload size={60} color="#999" />
        </div>

        {/* UPLOAD ZONE */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? "#007bff" : "#ccc"}`,
            borderRadius: "12px",
            padding: "60px 20px",
            textAlign: "center",
            backgroundColor: dragActive ? "#eef7ff" : "#fafafa",
            cursor: "pointer",
          }}
        >
          <input type="file" multiple id="file-input" onChange={handleChange} style={{ display: "none" }} />

          <label htmlFor="file-input" style={{ cursor: "pointer" }}>
            <Upload style={{ width: 50, height: 50, color: "#007bff" }} />
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>Drop files or click</p>
            <p style={{ color: "#666" }}>PDF, Word, Excel, Images</p>
          </label>
        </div>

        {/* FILES GRID */}
        {files.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
              Uploaded Files ({files.length})
            </h2>

            {files.map((file) => (
              <div key={file.id} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "20px",
                marginBottom: "12px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                background: "#fff"
              }}>

                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  <File size={30} color="#999" />
                  <div>
                    <p style={{ fontWeight: "bold" }}>{file.name}</p>
                    <p style={{ fontSize: "12px", color: "#666" }}>{formatFileSize(file.size)}</p>
                    {file.url && (
                      <a href={file.url} target="_blank" style={{ color: "#007bff", fontSize: "12px" }}>
                        View File
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  {file.status === "completed" ? (
                    <div style={{ color: "#28a745", display: "flex", alignItems: "center", gap: "5px" }}>
                      <CheckCircle size={18} /> Uploaded
                    </div>
                  ) : (
                    <span style={{ color: "#007bff" }}>Uploading...</span>
                  )}

                  <button
                    onClick={() => removeFile(file.id)}
                    style={{ background: "transparent", border: "none", color: "#dc3545" }}
                  >
                    <X size={18} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
