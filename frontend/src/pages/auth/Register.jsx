import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  UserPlus, Mail, Lock, User, Hash,
  Eye, EyeOff, GraduationCap, Briefcase
} from "lucide-react";
import api from "../../services/api";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";

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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Create account</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Join{" "}
            <span className="gradient-text font-semibold">UniEvents</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-card p-8">

          {/* Role selector */}
          <div className="mb-6">
            <label className="block mb-3">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {/* Student */}
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${role === "student"
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15 shadow-sm dark:shadow-glow-sm"
                    : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/8 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
              >
                <GraduationCap
                  className={`w-6 h-6 ${role === "student" ? "text-brand-500 dark:text-brand-400" : "text-slate-400"}`}
                />
                <span className={`text-sm font-medium ${role === "student" ? "text-brand-600 dark:text-brand-300" : "text-slate-600 dark:text-slate-300"}`}>
                  Student
                </span>
              </button>

              {/* Organizer */}
              <button
                type="button"
                onClick={() => setRole("organizer")}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${role === "organizer"
                    ? "border-brand-500 bg-brand-50 dark:bg-brand-500/15 shadow-sm dark:shadow-glow-sm"
                    : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/8 hover:border-slate-300 dark:hover:border-white/20"
                  }`}
              >
                <Briefcase
                  className={`w-6 h-6 ${role === "organizer" ? "text-brand-500 dark:text-brand-400" : "text-slate-400"}`}
                />
                <span className={`text-sm font-medium ${role === "organizer" ? "text-brand-600 dark:text-brand-300" : "text-slate-600 dark:text-slate-300"}`}>
                  Organizer
                </span>
              </button>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400 text-sm text-center animate-fade-in">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <Input
              label="Full Name"
              icon={User}
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={set("name")}
              autoComplete="name"
            />

            {/* Email */}
            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />

            {/* Enrollment ID — student only */}
            {role === "student" && (
              <div className="animate-fade-in">
                <Input
                  label="Enrollment ID"
                  icon={Hash}
                  type="text"
                  placeholder="e.g. 22CS0001"
                  value={form.enrollmentId}
                  onChange={set("enrollmentId")}
                />
              </div>
            )}

            {/* Password */}
            <Input
              label="Password"
              icon={Lock}
              type={showPw ? "text" : "password"}
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              icon={Lock}
              type={showConfirmPw ? "text" : "password"}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Submit */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              className="mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="border-t border-slate-100 dark:border-white/8 my-5" />

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
