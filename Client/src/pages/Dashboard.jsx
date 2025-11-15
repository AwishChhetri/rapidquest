
import { useState, useMemo } from 'react'
import { Search, Eye, TrendingUp } from 'lucide-react'
import FilePreviewModal from '../components/FilePreviewModal'

export default function Dashboard({ setShowChat }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    topics: [],
    teams: [],
    tags: [],
  })
  const [selectedFile, setSelectedFile] = useState(null)

  const mockFiles = [
    { id: 1, name: 'Q4 Financial Report.pdf', type: 'PDF', size: '2.4 MB', topic: 'Finance', team: 'Accounting', tags: ['report', 'fiscal'], content: '...' },
    { id: 2, name: 'Marketing Strategy 2024.docx', type: 'Document', size: '1.8 MB', topic: 'Marketing', team: 'Marketing', tags: ['strategy', 'planning'], content: '...' },
    { id: 3, name: 'Product Roadmap.xlsx', type: 'Spreadsheet', size: '956 KB', topic: 'Product', team: 'Product', tags: ['roadmap', 'planning'], content: '...' },
    { id: 4, name: 'Team Meeting Notes.txt', type: 'Text', size: '45 KB', topic: 'General', team: 'Engineering', tags: ['meeting', 'notes'], content: '...' },
    { id: 5, name: 'Brand Guidelines.pdf', type: 'PDF', size: '5.2 MB', topic: 'Design', team: 'Design', tags: ['brand', 'guidelines'], content: '...' },
    { id: 6, name: 'Screenshot.png', type: 'Image', size: '340 KB', topic: 'General', team: 'Marketing', tags: ['screenshot'], content: '...' },
  ]

  const filteredFiles = useMemo(() => {
    return mockFiles.filter((file) => {
      const matchSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchTopic = selectedFilters.topics.length === 0 || selectedFilters.topics.includes(file.topic)
      const matchTeam = selectedFilters.teams.length === 0 || selectedFilters.teams.includes(file.team)
      const matchTags = selectedFilters.tags.length === 0 || file.tags.some((tag) => selectedFilters.tags.includes(tag))

      return matchSearch && matchTopic && matchTeam && matchTags
    })
  }, [searchQuery, selectedFilters])

  const toggleFilter = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }))
  }

  const topics = ['Finance', 'Marketing', 'Product', 'Design', 'General']
  const teams = ['Accounting', 'Marketing', 'Product', 'Engineering', 'Design']
  const tags = ['report', 'strategy', 'planning', 'notes', 'brand', 'guidelines', 'meeting', 'fiscal', 'roadmap']

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-100">
      <div className="p-8 pb-20">

        {/* HEADER */}
        <div className="mb-10 p-8 border bg-white rounded-xl shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Search and manage your documents</p>
          </div>
          <TrendingUp size={55} className="text-gray-400" />
        </div>

        {/* SEARCH BAR */}
        <div className="mb-10 relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full bg-white border px-12 py-3 rounded-lg shadow-sm text-sm focus:ring-2 focus:ring-indigo-400"
            placeholder="Search files..."
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition
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

        {/* FILES GRID */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Files</h2>
            <span className="text-sm px-4 py-1.5 bg-gray-200 rounded-full">{filteredFiles.length} results</span>
          </div>

          {filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="p-5 bg-white border rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                      📄
                    </div>
                    <Eye size={20} className="text-gray-400" />
                  </div>

                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size}</p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
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
              No files match your search or filters.
            </div>
          )}
        </div>

      </div>

      {selectedFile && (
        <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}

    </div>
  )
}
