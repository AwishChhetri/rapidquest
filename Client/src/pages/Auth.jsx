'use client'

import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Mail, Lock, User, Briefcase, Users } from 'lucide-react';

export default function Auth({ setPage, setUser }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    teams: "",
    role: "marketer",
  });

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await axios.post("https://rapidquest-unzo.onrender.com/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department,
          teams: form.teams.split(",").map((t) => t.trim()),
          role: form.role,
        });

        setError("Account created successfully! Switching to login...");
        setTimeout(() => setMode("login"), 2000);
      } else {
        const res = await axios.post("https://rapidquest-unzo.onrender.com/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setUser(res.data.user);
        setPage("dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FileStation</h1>
          <p className="text-slate-400">
            {mode === "login" ? "Welcome back" : "Join our team"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-gradient-to-b from-slate-900/90 to-slate-800/90 backdrop-blur border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {/* Error/Success Message */}
          {error && (
            <div
              className={`mb-6 p-3 rounded-lg text-sm font-medium ${
                error.includes("successfully")
                  ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-200 border border-red-500/30"
              }`}
            >
              {error}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {mode === "register" && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    name="name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="relative">
                  <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    name="department"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition"
                    placeholder="Department (ex: Marketing)"
                    value={form.department}
                    onChange={handleInputChange}
                  />
                </div>

                <select
                  name="role"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white transition"
                  value={form.role}
                  onChange={handleInputChange}
                >
                  <option value="marketer">Marketer</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>

                <div className="relative">
                  <Users className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                  <input
                    name="teams"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition"
                    placeholder="Teams (comma separated)"
                    value={form.teams}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                name="email"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition"
                placeholder="Email"
                value={form.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition"
                placeholder="Password"
                value={form.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition transform hover:scale-105 active:scale-95 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {mode === "login" ? "Logging in..." : "Creating account..."}
              </span>
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Create Account"
            )}
          </button>

          {/* Toggle Mode */}
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
            className="w-full mt-4 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition"
          >
            {mode === "login"
              ? "Don't have an account? Register →"
              : "Already have an account? Login →"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          Secure authentication powered by WorkHub
        </p>
      </div>
    </div>
  );
}
