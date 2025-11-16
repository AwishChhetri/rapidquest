'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, Download, X, Send, MessageSquare, FileText, Users, Tag, BarChart3, ChevronDown, TrendingUp, HardDrive } from 'lucide-react'
import axios from 'axios'

export default function Dashboard({ user }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    topics: [],
    teams: [],
    tags: [],
  })
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedSummaryFile, setSelectedSummaryFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello! 👋 I\'m your AI assistant. Ask me anything about your documents or need help with analysis?' }
  ])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // FETCH FILES
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get('http://localhost:3000/files', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setFiles(res.data.files)
      } catch (error) {
        console.log('❌ Error fetching files:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFiles()
  }, [token])

  // FILTERING
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTopic = selectedFilters.topics.length === 0 || selectedFilters.topics.includes(file.topic)
      const matchTeam = selectedFilters.teams.length === 0 || selectedFilters.teams.includes(file.team)
      const matchTags = selectedFilters.tags.length === 0 || file.tags?.some((t) => selectedFilters.tags.includes(t))
      return matchSearch && matchTopic && matchTeam && matchTags
    })
  }, [files, searchQuery, selectedFilters])

  const metrics = useMemo(() => {
    const totalSize = files.reduce((sum, f) => {
      const sizeNum = parseFloat(f.size) || 0
      return sum + sizeNum
    }, 0)
    
    // Format size in MB/GB
    const formatSize = (mb) => {
      if (mb >= 1024) {
        return (mb / 1024).toFixed(2) + ' KB'
      }
      return mb.toFixed(2) + ' MB'
    }

    return {
      totalFiles: files.length,
      totalSize: formatSize(totalSize),
      totalTeams: [...new Set(files.map(f => f.team))].filter(Boolean).length,
      totalTopics: [...new Set(files.map(f => f.topic))].filter(Boolean).length,
      filteredCount: filteredFiles.length,
      filteredSize: formatSize(filteredFiles.reduce((sum, f) => sum + (parseFloat(f.size) || 0), 0))
    }
  }, [files, filteredFiles])

  const toggleFilter = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }))
  }

  const topics = [...new Set(files.map(f => f.topic))].filter(Boolean)
  const teams = [...new Set(files.map(f => f.team))].filter(Boolean)
  const tags = [...new Set(files.flatMap(f => f.tags || []))]

  // DOWNLOAD
  const downloadFile = (url, name) => {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // CHATBOT
  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages(prev => [...prev, userMessage])
    const question = input
    setInput('')
    setChatLoading(true)

    try {
      const res = await axios.post(
        'http://localhost:3000/chat',
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMessages(prev => [...prev, { role: 'bot', text: res.data.answer }])
    } catch (err) {
      console.log('❌ Chat error:', err)
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Sorry, I encountered an error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const FilePreviewModal = ({ file, onClose }) => {
    if (!file) return null
    const url = file.cloudinaryUrl
    const mime = file.mime || file.type || ''
    const isImage = mime.startsWith('image') || url.match(/\.(png|jpg|jpeg|webp)$/i)
    const isPDF = mime === 'application/pdf' || url.endsWith('.pdf')
    const isText = mime.startsWith('text') || url.endsWith('.txt') || url.endsWith('.md')

    const renderPreview = () => {
      if (isImage) return <img src={url || "/placeholder.svg"} className="max-h-[60vh] rounded-lg" alt={file.name} />
      if (isPDF) return <iframe src={url} className="w-full h-[60vh]" />
      if (isText) return <div className="p-6 whitespace-pre-wrap text-sm bg-gray-50">{file.content || 'No content'}</div>
      return <div className="p-6 text-center text-gray-500">Preview not supported</div>
    }

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
            <div>
              <h2 className="font-bold text-xl text-gray-900">{file.name}</h2>
              <p className="text-xs text-gray-500 mt-1">{mime || 'Unknown type'}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition">
              <X size={24} className="text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
            {renderPreview()}
          </div>
          <div className="flex gap-3 p-6 border-t bg-white">
            <button
              onClick={() => downloadFile(url, file.name)}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition"
            >
              <Download size={18} /> Download
            </button>
            <button onClick={onClose} className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const SummaryModal = ({ file, onClose }) => {
    if (!file) return null
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="font-bold text-xl text-gray-900">{file.name}</h2>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full font-medium">
                    {file.topic}
                  </span>
                  <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium">
                    {file.team}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-lg transition">
                <X size={24} className="text-gray-600" />
              </button>
            </div>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  Document Summary
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {file.summary || 'No summary available for this document.'}
                </p>
              </div>
              {file.tags && file.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Tag size={18} className="text-purple-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {file.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  const MetricCard = ({ icon: Icon, label, value, subLabel, color, gradient }) => (
    <div className={`p-6 bg-gradient-to-br ${gradient} rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-105 border border-white/20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80 font-medium">{label}</p>
          <p className="text-3xl font-bold mt-2 text-white">{value}</p>
          {subLabel && <p className="text-xs text-white/60 mt-1">{subLabel}</p>}
        </div>
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur">
          <Icon size={32} className="text-white" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="p-8 pb-32">
        <div className="mb-12 p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">
                {user?.name ? `Welcome back, ${user.name}! 👋` : 'Dashboard'}
              </h1>
              <p className="text-indigo-100 mt-2 text-base">
                Manage, analyze, and collaborate on your documents with AI-powered insights
              </p>
            </div>
            <BarChart3 size={64} className="text-white opacity-20" />
          </div>
        </div>

        <div className="mb-12">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp size={16} />
              Live metrics
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard 
              icon={FileText} 
              label="Total Documents" 
              value={metrics.totalFiles}
              subLabel={`${metrics.filteredCount} visible`}
              gradient="from-blue-500 to-cyan-500"
            />
            <MetricCard 
              icon={Users} 
              label="Teams" 
              value={metrics.totalTeams}
              subLabel="Active teams"
              gradient="from-purple-500 to-pink-500"
            />
            <MetricCard 
              icon={Tag} 
              label="Topics" 
              value={metrics.totalTopics}
              subLabel="Categorized"
              gradient="from-orange-500 to-red-500"
            />
            <MetricCard 
              icon={HardDrive} 
              label="Storage" 
              value={metrics.totalSize}
              subLabel={`${metrics.filteredSize} visible`}
              gradient="from-emerald-500 to-teal-500"
            />
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-10 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full bg-slate-800/50 border border-slate-700 px-12 py-3 rounded-xl shadow-sm text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-slate-500"
            placeholder="Search documents by name, topic, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="space-y-6 mb-12">
          {/* TOPICS */}
          {topics.length > 0 && (
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ChevronDown size={18} className="text-indigo-400" />
                Topics ({selectedFilters.topics.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleFilter('topics', t)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedFilters.topics.includes(t)
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 border border-slate-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TEAMS */}
          {teams.length > 0 && (
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ChevronDown size={18} className="text-purple-400" />
                Teams ({selectedFilters.teams.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {teams.map((team) => (
                  <button
                    key={team}
                    onClick={() => toggleFilter('teams', team)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedFilters.teams.includes(team)
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 border border-slate-600'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAGS */}
          {tags.length > 0 && (
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <ChevronDown size={18} className="text-pink-400" />
                Tags ({selectedFilters.tags.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilter('tags', tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedFilters.tags.includes(tag)
                        ? 'bg-pink-600 text-white shadow-lg'
                        : 'bg-slate-700/50 text-slate-200 hover:bg-slate-600/50 border border-slate-600'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-400 mt-4">Loading your documents...</p>
          </div>
        )}

        {/* FILES GRID */}
        {!loading && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Your Documents</h2>
              <span className="px-4 py-2 bg-indigo-600/30 text-indigo-200 rounded-full font-semibold text-sm border border-indigo-500/50">
                {filteredFiles.length} found
              </span>
            </div>

            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.map((file) => (
                  <div
                    key={file._id}
                    className="group p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg hover:shadow-2xl hover:border-indigo-500/50 transition duration-300 cursor-pointer backdrop-blur"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="w-16 h-16 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-lg flex items-center justify-center text-4xl hover:scale-110 transition border border-indigo-500/30"
                        onClick={() => setSelectedFile(file)}
                      >
                        📄
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="p-2 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 rounded-lg transition border border-indigo-500/30"
                          title="Preview"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => downloadFile(file.cloudinaryUrl, file.name)}
                          className="p-2 bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 rounded-lg transition border border-emerald-500/30"
                          title="Download"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-white text-base mb-1 truncate">{file.name}</h3>
                    <p className="text-xs text-slate-400 mb-4">{file.size}</p>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span className="px-3 py-1 text-xs bg-indigo-500/30 text-indigo-200 rounded-md font-medium border border-indigo-500/30">
                        {file.topic}
                      </span>
                      <span className="px-3 py-1 text-xs bg-purple-500/30 text-purple-200 rounded-md font-medium border border-purple-500/30">
                        {file.team}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedSummaryFile(file)}
                      className="w-full py-2 text-sm bg-gradient-to-r from-blue-500/30 to-cyan-500/30 hover:from-blue-500/50 hover:to-cyan-500/50 text-blue-200 font-medium rounded-lg transition border border-blue-500/30"
                    >
                      📋 View Summary
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-slate-700 bg-slate-800/30 rounded-xl">
                <FileText size={48} className="mx-auto text-slate-500 mb-4" />
                <p className="text-slate-300 font-medium">No documents found</p>
                <p className="text-slate-500 text-sm">Try adjusting your filters or search query</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {selectedFile && <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />}

      {/* SUMMARY MODAL */}
      {selectedSummaryFile && <SummaryModal file={selectedSummaryFile} onClose={() => setSelectedSummaryFile(null)} />}

      {showChat && (
        <div className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-700 shadow-2xl flex flex-col z-50">
          <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-indigo-600 to-purple-600">
            <h2 className="font-bold text-lg flex items-center gap-2 text-white">
              <MessageSquare size={20} />
              AI Assistant
            </h2>
            <p className="text-indigo-100 text-xs mt-1">Ask anything about your documents</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-900/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-700 bg-slate-800/50 space-y-3">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-slate-600 bg-slate-700/50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder-slate-500"
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={chatLoading}
              />
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                onClick={sendMessage}
                disabled={chatLoading || !input.trim()}
              >
                <Send size={18} />
              </button>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="w-full py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full flex justify-center items-center shadow-2xl hover:shadow-3xl transition transform hover:scale-110 z-40 border border-indigo-500/50"
        title="Chat with AI"
      >
        <MessageSquare size={28} />
      </button>
    </div>
  )
}
