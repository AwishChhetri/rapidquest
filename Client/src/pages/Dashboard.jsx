'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, Download, X, Send, MessageSquare, FileText, Users, Tag, BarChart3, ChevronDown } from 'lucide-react'
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

  // METRICS CALCULATION
  const metrics = useMemo(() => {
    const totalSize = files.reduce((sum, f) => {
      const sizeNum = parseFloat(f.size) || 0
      return sum + sizeNum
    }, 0)
    return {
      totalFiles: files.length,
      totalSize: totalSize.toFixed(2),
      totalTeams: [...new Set(files.map(f => f.team))].length,
      totalTopics: [...new Set(files.map(f => f.topic))].length,
    }
  }, [files])

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

  const MetricCard = ({ icon: Icon, label, value, color }) => (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
        </div>
        <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('-900', '-100')}`}>
          <Icon size={32} className={color} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-8 pb-32">
        <div className="mb-12 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">
                {user?.name ? `Welcome back, ${user.name}! 👋` : 'Dashboard'}
              </h1>
              <p className="text-indigo-100 mt-2 text-base">
                Manage, analyze, and collaborate on your documents with AI-powered insights
              </p>
            </div>
            <BarChart3 size={64} className="text-indigo-200 opacity-80" />
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard icon={FileText} label="Total Documents" value={metrics.totalFiles} color="text-indigo-600" />
          <MetricCard icon={Users} label="Teams" value={metrics.totalTeams} color="text-purple-600" />
          <MetricCard icon={Tag} label="Topics" value={metrics.totalTopics} color="text-pink-600" />
          <MetricCard icon={BarChart3} label="Total Size" value={`${metrics.totalSize} MB`} color="text-cyan-600" />
        </div>

        {/* SEARCH */}
        <div className="mb-10 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full bg-white border border-gray-300 px-12 py-3 rounded-xl shadow-sm text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            placeholder="Search documents by name, topic, or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="space-y-6 mb-12">
          {/* TOPICS */}
          {topics.length > 0 && (
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronDown size={18} className="text-indigo-600" />
                Topics ({selectedFilters.topics.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleFilter('topics', t)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedFilters.topics.includes(t)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronDown size={18} className="text-purple-600" />
                Teams ({selectedFilters.teams.length})
              </h3>
              <div className="flex flex-wrap gap-3">
                {teams.map((team) => (
                  <button
                    key={team}
                    onClick={() => toggleFilter('teams', team)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      selectedFilters.teams.includes(team)
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronDown size={18} className="text-pink-600" />
                Tags ({selectedFilters.tags.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleFilter('tags', tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                      selectedFilters.tags.includes(tag)
                        ? 'bg-pink-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            <p className="text-gray-600 mt-4">Loading your documents...</p>
          </div>
        )}

        {/* FILES GRID */}
        {!loading && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Documents</h2>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-sm">
                {filteredFiles.length} found
              </span>
            </div>

            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.map((file) => (
                  <div
                    key={file._id}
                    className="group p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-indigo-300 transition duration-300 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-4xl hover:scale-110 transition"
                        onClick={() => setSelectedFile(file)}
                      >
                        📄
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setSelectedFile(file)}
                          className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg transition"
                          title="Preview"
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={() => downloadFile(file.cloudinaryUrl, file.name)}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition"
                          title="Download"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{file.name}</h3>
                    <p className="text-xs text-gray-500 mb-4">{file.size}</p>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md font-medium">
                        {file.topic}
                      </span>
                      <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md font-medium">
                        {file.team}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedSummaryFile(file)}
                      className="w-full py-2 text-sm bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 font-medium rounded-lg transition border border-blue-200"
                    >
                      📋 View Summary
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border-2 border-dashed border-gray-300 bg-white rounded-xl">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">No documents found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or search query</p>
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
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-300 shadow-2xl flex flex-col z-50">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <MessageSquare size={20} />
              AI Assistant
            </h2>
            <p className="text-indigo-100 text-xs mt-1">Ask anything about your documents</p>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white space-y-3">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* CHAT BUTTON */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full flex justify-center items-center shadow-2xl hover:shadow-3xl transition transform hover:scale-110 z-40"
        title="Chat with AI"
      >
        <MessageSquare size={28} />
      </button>
    </div>
  )
}
