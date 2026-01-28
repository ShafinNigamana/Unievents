import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md p-6">
        <h1 className="mb-2 text-center">Register</h1>
        <p className="text-center mb-6">
          Create your Unievents account
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-700 text-white text-sm font-medium py-2 rounded-md hover:bg-indigo-800"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-700 dark:text-indigo-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
