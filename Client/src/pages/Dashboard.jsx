'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Eye, TrendingUp, Download } from 'lucide-react'
import axios from 'axios'
import FilePreviewModal from '../components/FilePreviewModal'

export default function Dashboard({ user }) {

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    topics: [],
    teams: [],
    tags: [],
  })
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(true)

  // chatbot
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // ----------------------------------
  // FETCH FILES WITH AUTH TOKEN
  // ----------------------------------
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get("http://localhost:3000/files", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        setFiles(res.data.files)
      } catch (error) {
        console.log("❌ Error fetching files:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFiles()
  }, [token])

  // ----------------------------------
  // FILTERING
  // ----------------------------------
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTopic = selectedFilters.topics.length === 0 || selectedFilters.topics.includes(file.topic)
      const matchTeam = selectedFilters.teams.length === 0 || selectedFilters.teams.includes(file.team)
      const matchTags = selectedFilters.tags.length === 0 || file.tags?.some((t) => selectedFilters.tags.includes(t))

      return matchSearch && matchTopic && matchTeam && matchTags
    })
  }, [files, searchQuery, selectedFilters])

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

  // ----------------------------------
  // DOWNLOAD FILE
  // ----------------------------------
  const downloadFile = (url, name) => {
    const a = document.createElement("a")
    a.href = url
    a.download = name
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // ----------------------------------
  // CHATBOT — SEND MESSAGE
  // ----------------------------------
  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", text: input }
    setMessages(prev => [...prev, userMessage])

    const question = input
    setInput("")

    try {
      const res = await axios.post(
        "http://localhost:3000/chat",
        { question },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setMessages(prev => [...prev, { role: "bot", text: res.data.answer }])

    } catch (err) {
      console.log("❌ Chat error:", err)
      setMessages(prev => [
        ...prev,
        { role: "bot", text: "Error processing your question." }
      ])
    }
  }

  // ----------------------------------
  // UI
  // ----------------------------------
  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-100">

      <div className="p-8 pb-20">

        {/* HEADER */}
        <div className="mb-10 p-8 border bg-white rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">
              {user?.name ? `Hi, ${user.name}!` : "Dashboard"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Search, filter and manage your documents
            </p>
          </div>
          <TrendingUp size={55} className="text-gray-400" />
        </div>

        {/* SEARCH BAR */}
        <div className="mb-10 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full bg-white border px-12 py-3 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-400"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-6 mb-12">

          {/* TOPICS */}
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">Topics</h3>
            <div className="flex flex-wrap gap-3">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleFilter('topics', t)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition 
                    ${selectedFilters.topics.includes(t)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* TEAMS */}
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">Teams</h3>
            <div className="flex flex-wrap gap-3">
              {teams.map((team) => (
                <button
                  key={team}
                  onClick={() => toggleFilter('teams', team)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition 
                    ${selectedFilters.teams.includes(team)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>

          {/* TAGS */}
          <div className="p-6 bg-white border rounded-xl shadow-sm">
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleFilter('tags', tag)}
                  className={`px-3 py-1 rounded-full text-xs transition
                    ${selectedFilters.tags.includes(tag)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* LOADING */}
        {loading && <div className="text-center py-20 text-gray-500">Loading files...</div>}

        {/* FILES GRID */}
        {!loading && (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Files</h2>
              <span className="text-sm px-4 py-1.5 bg-gray-200 rounded-full">
                {filteredFiles.length} results
              </span>
            </div>

            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.map((file) => (
                  <div
                    key={file._id}
                    className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl"
                        onClick={() => setSelectedFile(file)}
                      >
                        📄
                      </div>

                      <div className="flex gap-3">
                        <Eye
                          size={22}
                          className="text-gray-400 cursor-pointer"
                          onClick={() => setSelectedFile(file)}
                        />
                        <Download
                          size={22}
                          className="text-gray-400 cursor-pointer"
                          onClick={() => downloadFile(file.cloudinaryUrl, file.name)}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-2">
                      <span className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-md">
                        {file.topic}
                      </span>
                      <span className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md">
                        {file.team}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed bg-white rounded-xl text-gray-500">
                No files found.
              </div>
            )}
          </>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {selectedFile && (
        <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}

      {/* CHATBOT PANEL */}
      {showChat && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-2xl flex flex-col z-50">

          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-lg">AI Assistant</h2>
            <button onClick={() => setShowChat(false)} className="text-gray-600">✖</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-indigo-100 ml-auto"
                    : "bg-gray-200"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2"
                placeholder="Ask about your documents..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>

        </div>
      )}

      {/* CHAT BUTTON */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex justify-center items-center text-3xl shadow-xl"
      >
        💬
      </button>

    </div>
  )
}
