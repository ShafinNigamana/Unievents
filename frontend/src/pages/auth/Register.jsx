import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus, Mail, Lock, User, Hash,
  Loader2, Eye, EyeOff, GraduationCap, Briefcase
} from "lucide-react";
import api from "../../services/api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    enrollmentId: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Name is required.";
    if (!emailRegex.test(form.email)) return "Enter a valid email address.";
    if (form.password.length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (role === "student" && !form.enrollmentId.trim()) return "Enrollment ID is required for students.";
    if (role === "student" && !/^[a-zA-Z0-9]+$/.test(form.enrollmentId))
      return "Enrollment ID must be alphanumeric.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const err = validate();
    if (err) { setError(err); return; }

    try {
      setLoading(true);
      await api.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        role,
        enrollmentId: role === "student" ? form.enrollmentId.trim() : undefined,
      });

      setSuccess("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page py-16">
      <div className="w-full max-w-md animate-slide-up">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient shadow-glow mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-1">Create account</h1>
          <p className="text-slate-400">
            Join{" "}
            <span className="gradient-text font-semibold">UniEvents</span>
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">

          {/* Role selector */}
          <div className="mb-6">
            <label className="block mb-3">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Student */}
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${role === "student"
                    ? "border-brand-500 bg-brand-500/15 shadow-glow-sm"
                    : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
                  }`}
              >
                <GraduationCap
                  className={`w-6 h-6 ${role === "student" ? "text-brand-400" : "text-slate-400"}`}
                />
                <span className={`text-sm font-medium ${role === "student" ? "text-brand-300" : "text-slate-300"}`}>
                  Student
                </span>
              </button>

              {/* Organizer */}
              <button
                type="button"
                onClick={() => setRole("organizer")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${role === "organizer"
                    ? "border-brand-500 bg-brand-500/15 shadow-glow-sm"
                    : "border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20"
                  }`}
              >
                <Briefcase
                  className={`w-6 h-6 ${role === "organizer" ? "text-brand-400" : "text-slate-400"}`}
                />
                <span className={`text-sm font-medium ${role === "organizer" ? "text-brand-300" : "text-slate-300"}`}>
                  Organizer
                </span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center animate-fade-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set("name")}
                  className="input pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={set("email")}
                  className="input pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Enrollment ID — student only */}
            {role === "student" && (
              <div className="animate-fade-in">
                <label className="block mb-1.5">Enrollment ID</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. 22CS0001"
                    value={form.enrollmentId}
                    onChange={set("enrollmentId")}
                    className="input pl-10"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set("password")}
                  className="input pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={set("confirmPassword")}
                  className="input pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="button-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="divider" />

          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
