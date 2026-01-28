import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md p-6">
        <h1 className="mb-2 text-center">Login</h1>
        <p className="text-center mb-6">
          Sign in to your Unievents account
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 border border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-700 text-white text-sm font-medium py-2 rounded-md hover:bg-indigo-800"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-indigo-700 dark:text-indigo-400 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
