import { useState } from "react";
import axios from "axios";

export default function Auth({ setPage, setUser }) {
  const [mode, setMode] = useState("login"); 
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    teams: "",
    role: "marketer",
  });

  const handleSubmit = async () => {
    try {
      if (mode === "register") {
        const res = await axios.post("http://localhost:3000/register", {
          name: form.name,
          email: form.email,
          password: form.password,
          department: form.department,
          teams: form.teams.split(",").map((t) => t.trim()),
          role: form.role,
        });

        alert("Account created successfully!");
        setMode("login");
      } else {
        const res = await axios.post("http://localhost:3000/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        setUser(res.data.user);
        setPage("dashboard");
      }
    } catch (err) {
      alert("Error: " + err.response?.data?.error || "Something went wrong");
      console.log(err);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center bg-gray-100 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {mode === "login" ? "Login" : "Create Account"}
        </h2>

        {mode === "register" && (
          <>
            <input
              className="w-full p-3 border rounded mb-3"
              placeholder="Full Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <input
              className="w-full p-3 border rounded mb-3"
              placeholder="Department (ex: Marketing)"
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />

            <select
              className="w-full p-3 border rounded mb-3"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="marketer">Marketer</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>

            <input
              className="w-full p-3 border rounded mb-3"
              placeholder="Teams (comma separated)"
              onChange={(e) => setForm({ ...form, teams: e.target.value })}
            />
          </>
        )}

        <input
          className="w-full p-3 border rounded mb-3"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="w-full p-3 border rounded mb-6"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="w-full p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {mode === "login" ? "Login" : "Create Account"}
        </button>

        <p
          className="mt-6 text-center text-indigo-600 cursor-pointer"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Don't have an account? Register →"
            : "Already have an account? Login →"}
        </p>
      </div>
    </div>
  );
}
