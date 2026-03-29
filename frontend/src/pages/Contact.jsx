import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Send,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock,
} from "lucide-react";
import api from "../services/api";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

/* ── Contact Info Card ── */
function InfoCard({ icon: Icon, color, title, value, href }) {
  const content = (
    <div className="glass-card p-6 flex items-start gap-4 hover:border-brand-500/20 transition-all duration-300 group">
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-1">
          {title}
        </p>
        <p className="text-sm text-white font-medium leading-relaxed">
          {value}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }
  return content;
}

/* ── Main Contact Page ── */
export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear messages on new input
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await api.post("/public/contact", form);
      setSuccess(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const isValid =
    form.name.trim() &&
    form.email.trim() &&
    form.subject.trim() &&
    form.message.trim();

  return (
    <div className="min-h-screen bg-surface-900 text-slate-100">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-700/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-56 h-56 bg-purple-700/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
            <MessageSquare className="w-3.5 h-3.5" />
            Get in Touch
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            We'd love to{" "}
            <span className="gradient-text">hear from you</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl mx-auto">
            Have a question, suggestion, or need support? Drop us a message and
            we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* ── Left: Contact Info ── */}
            <div className="lg:col-span-2 space-y-4">
              <div className="mb-6">
                <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-2">
                  Contact Information
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Reach out through any of these channels, or fill in the form
                  and we'll respond within 24 hours.
                </p>
              </div>

              <InfoCard
                icon={Mail}
                color="bg-brand-500/80"
                title="Email"
                value="support@unievents.edu"
                href="mailto:support@unievents.edu"
              />
              <InfoCard
                icon={Phone}
                color="bg-purple-600/80"
                title="Phone"
                value="+91 98765 43210"
                href="tel:+919876543210"
              />
              <InfoCard
                icon={MapPin}
                color="bg-blue-600/80"
                title="Address"
                value="University Campus, Main Building, Room 204"
              />
              <InfoCard
                icon={Clock}
                color="bg-amber-600/80"
                title="Office Hours"
                value="Mon – Fri, 9:00 AM – 5:00 PM"
              />
            </div>

            {/* ── Right: Form ── */}
            <div className="lg:col-span-3">
              <div className="glass-card p-6 sm:p-8">
                {/* Success message */}
                {success && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 mb-6 animate-fade-in">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-300">
                        Message sent successfully!
                      </p>
                      <p className="text-xs text-green-400/70 mt-0.5">
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-300">
                        Failed to send message
                      </p>
                      <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name & Email row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-name" className="block mb-2">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block mb-2">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="contact-subject" className="block mb-2">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      placeholder="What's this about?"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="input"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="contact-message" className="block mb-2">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      placeholder="Tell us more about your question or feedback..."
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="input resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting || !isValid}
                    className="button-primary w-full py-3.5 text-base"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
