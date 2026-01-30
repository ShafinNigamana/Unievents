import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { UserPlus } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const phoneRegex = /^(\+91)?[0-9]{10}$/;
const enrollmentRegex = /^[a-zA-Z0-9]+$/;

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    enrollmentId: "",
    phone: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      return "All required fields must be filled";
    }

    if (!emailRegex.test(form.email)) {
      return "Please enter a valid email address";
    }

    if (!passwordRegex.test(form.password)) {
      return "Password must be at least 8 characters and include one uppercase letter, one number, and one special character";
    }

    if (form.password !== form.confirmPassword) {
      return "Passwords do not match";
    }

    if (form.role === "student") {
      if (!form.enrollmentId) {
        return "Enrollment ID is required for students";
      }
      if (!enrollmentRegex.test(form.enrollmentId)) {
        return "Enrollment ID must contain only letters and numbers";
      }
    }

    if (form.phone && !phoneRegex.test(form.phone)) {
      return "Enter a valid phone number";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        enrollmentId:
          form.role === "student" ? form.enrollmentId : undefined,
        phone: form.phone || undefined,
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-md p-6">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
            <UserPlus className="h-5 w-5 text-indigo-700 dark:text-indigo-300" />
          </div>
          <h1>Create Account</h1>
          <p className="mt-1 text-center">
            Register to access university events
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 text-center">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="input"
            />
            <input
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="input"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input"
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </select>

            {form.role === "student" && (
              <input
                name="enrollmentId"
                placeholder="Enrollment ID"
                value={form.enrollmentId}
                onChange={handleChange}
                className="input"
              />
            )}
          </div>

          <input
            name="phone"
            placeholder="Phone (optional)"
            value={form.phone}
            onChange={handleChange}
            className="input"
          />

          <button
            type="submit"
            className="button-primary w-full"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
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
