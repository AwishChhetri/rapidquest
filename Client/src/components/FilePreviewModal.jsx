'use client'

import { X, Download, FileText } from 'lucide-react'

export default function FilePreviewModal({ file, onClose }) {
  const renderPreview = () => {
    const type = file.type.toLowerCase()

    if (type === 'image') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', backgroundColor: '#f0f0f0', minHeight: '300px' }}>
          <p style={{ color: '#999' }}>Image preview not available</p>
        </div>
      )
    }

    if (type === 'pdf') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px', textAlign: 'center' }}>
          <div>
            <FileText size={60} color="#dc3545" style={{ margin: '0 auto 20px' }} />
            <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>{file.name}</p>
            <p style={{ color: '#666' }}>{file.content}</p>
          </div>
        </div>
      )
    }

    if (type === 'spreadsheet') {
      return (
        <div style={{ overflow: 'auto', padding: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Q1</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Q2</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Q3</td>
                <td style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>Q4</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>$100K</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>$150K</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>$200K</td>
                <td style={{ border: '1px solid #ddd', padding: '12px' }}>$250K</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }

    return (
      <div style={{ padding: '30px', maxHeight: '400px', overflow: 'auto' }}>
        <p style={{ color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{file.content}</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #ddd' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '5px' }}>{file.name}</h2>
            <p style={{ fontSize: '12px', color: '#666' }}>{file.type} • {file.size}</p>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '8px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Content */}
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#fafafa' }}>
          {renderPreview()}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', padding: '20px', borderTop: '1px solid #ddd' }}>
          <button style={{ flex: 1, padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Download size={20} />
            Download
          </button>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '12px', backgroundColor: '#f0f0f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
