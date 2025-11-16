'use client'

import { useState } from 'react'
import { ArrowRight, Zap, Shield, Brain, Users, Upload, MessageSquare, BarChart3 } from 'lucide-react'

export default function Landing({ setPage }) {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  const features = [
    { icon: Upload, title: 'Smart Upload', description: 'Drag and drop files with instant AI analysis' },
    { icon: Brain, title: 'AI Powered', description: 'Gemini AI generates smart summaries automatically' },
    { icon: MessageSquare, title: 'Chatbot', description: 'Ask questions about your documents in real-time' },
    { icon: Users, title: 'Team Collab', description: 'Share and collaborate with your marketing team' },
    { icon: Shield, title: 'Secure', description: 'Enterprise-grade encryption and data protection' },
    { icon: BarChart3, title: 'Analytics', description: 'Track usage and insights with detailed reports' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white border-opacity-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Zap size={24} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">RapidQuest</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setPage("login")}
              className="text-gray-300 hover:text-white transition"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500 bg-opacity-20 border border-indigo-500 border-opacity-30">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
              <span className="text-indigo-200 text-sm font-medium">Now with Advanced AI Summaries</span>
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Smart Document Management for
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"> Marketing Teams</span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Powered by Gemini AI. Upload files, get instant AI summaries, collaborate with your team, and make smarter decisions in seconds.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button
              onClick={() => setPage("register")}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg transition duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
            </button>

            <button
              onClick={() => setPage("login")}
              className="px-8 py-4 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-semibold rounded-lg backdrop-blur transition border border-white border-opacity-20"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="pt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-400">10K+</p>
              <p className="text-gray-400 text-sm">Documents Processed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-400">500+</p>
              <p className="text-gray-400 text-sm">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-400">99.9%</p>
              <p className="text-gray-400 text-sm">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400">Everything you need for modern document management</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-indigo-500 transition duration-300 transform hover:scale-105 cursor-pointer"
              >
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg w-fit mb-4 group-hover:scale-110 transition">
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to transform your workflow?</h3>
          <p className="text-indigo-100 mb-8 text-lg">Join hundreds of marketing teams already using RapidQuest AI</p>
          <button
            onClick={() => setPage("register")}
            className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition transform hover:scale-105"
          >
            Get Started Now
          </button>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white border-opacity-10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© 2025 RapidQuest AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
