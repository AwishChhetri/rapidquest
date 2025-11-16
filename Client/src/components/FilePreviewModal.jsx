'use client'

import { X, Download, FileText, ImageIcon, File } from 'lucide-react'

export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null

  const url = file.cloudinaryUrl
  const mime = file.mime || file.type || ""

  const isImage = mime.startsWith("image") || url.match(/\.(png|jpg|jpeg|webp)$/i)
  const isPDF = mime === "application/pdf" || url.endsWith(".pdf")
  const isText = mime.startsWith("text") || url.endsWith(".txt") || url.endsWith(".md")
  const isExcel = mime.includes("sheet") || url.match(/\.(xlsx|xls|csv)$/i)

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8">
          <img src={url || "/placeholder.svg"} alt={file.name} className="max-h-[75vh] max-w-full rounded-xl shadow-2xl" />
        </div>
      )
    }

    if (isPDF) {
      return (
        <iframe src={url} className="w-full h-full rounded-lg" />
      )
    }

    if (isExcel) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto text-indigo-400 mb-4" />
            <p className="text-indigo-900 font-semibold">Excel preview not supported</p>
            <p className="text-indigo-600 text-sm mt-1">Download the file to view</p>
          </div>
        </div>
      )
    }

    if (isText) {
      return (
        <div className="p-8 whitespace-pre-wrap text-sm bg-gradient-to-br from-slate-50 to-slate-100 overflow-auto font-mono text-slate-700 leading-relaxed">
          {file.content || "No text available"}
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <File className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 font-semibold">Preview not available</p>
        </div>
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200">

        <div className="flex justify-between items-start p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {isImage && <ImageIcon className="w-6 h-6 text-indigo-600" />}
              {(isPDF || isExcel || isText) && <FileText className="w-6 h-6 text-blue-600" />}
              {!(isImage || isPDF || isExcel || isText) && <File className="w-6 h-6 text-slate-600" />}
              <div>
                <h2 className="font-bold text-lg text-slate-900">{file.name}</h2>
                <p className="text-xs text-slate-500 mt-1">{mime || 'File'}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors duration-200"
          >
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-slate-50">
          {renderPreview()}
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            onClick={download}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Download size={20} />
            Download
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-200 text-slate-900 rounded-lg font-semibold hover:bg-slate-300 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
