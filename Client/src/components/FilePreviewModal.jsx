'use client'

import { X, Download } from 'lucide-react'

export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null

  const url = file.cloudinaryUrl
  const mime = file.mime || file.type || ""

  const isImage = mime.startsWith("image") || url.match(/\.(png|jpg|jpeg|webp)$/i)
  const isPDF = mime === "application/pdf" || url.endsWith(".pdf")
  const isText =
    mime.startsWith("text") ||
    url.endsWith(".txt") ||
    url.endsWith(".md")

  const isExcel =
    mime.includes("sheet") ||
    url.match(/\.(xlsx|xls|csv)$/i)

  // -------------------------
  // PREVIEW LOGIC
  // -------------------------
  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <img src={url} className="max-h-[75vh] rounded-lg shadow" />
        </div>
      )
    }

    if (isPDF) {
      return (
        <iframe src={url} className="w-full h-full" />
      )
    }

    if (isExcel) {
      return (
        <div className="p-6 text-center text-gray-600">
          Excel preview not supported. Download file instead.
        </div>
      )
    }

    if (isText) {
      return (
        <div className="p-6 whitespace-pre-wrap text-sm bg-white overflow-auto">
          {file.content || "No text available"}
        </div>
      )
    }

    return (
      <div className="p-6 text-center text-gray-500">
        Preview not supported for this file type.
      </div>
    )
  }

  const download = () => {
    const a = document.createElement("a")
    a.href = url
    a.download = file.name
    a.click()
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="font-semibold text-lg">{file.name}</h2>
            <p className="text-xs text-gray-500">{mime}</p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={22} />
          </button>
        </div>

        {/* PREVIEW */}
        <div className="flex-1 overflow-auto bg-gray-50">
          {renderPreview()}
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 p-4 border-t bg-white">
          <button
            onClick={download}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Download
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 rounded-lg font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
