import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  GraduationCap,
  Megaphone,
  ClipboardList,
  Star,
  Building2,
  Archive,
  Globe,
  Sparkles,
  Target,
  Eye,
  Heart,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

/* ── Stat Card ── */
function StatCard({ icon: Icon, color, label, value, loading }) {
  return (
    <div className="glass-card p-6 flex flex-col items-center text-center gap-3 hover:border-brand-500/20 transition-all duration-300 group">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      {loading ? (
        <div className="space-y-2 w-full flex flex-col items-center">
          <div className="h-8 w-16 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-3xl sm:text-4xl font-bold gradient-text">{value}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">
            {label}
          </p>
        </>
      )}
    </div>
  );
}

/* ── Value Card ── */
function ValueCard({ icon: Icon, color, title, description }) {
  return (
    <div className="glass-card p-7 flex flex-col gap-4 hover:border-brand-500/30 transition-all duration-300 group">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ── Main About Page ── */
export default function About() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/public/stats");
        setStats(data.data);
      } catch {
        // Gracefully handle — stats will show as dashes
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fmt = (n) => {
    if (n === undefined || n === null) return "—";
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  };

  const statItems = [
    {
      icon: Calendar,
      color: "bg-brand-500/80",
      label: "Total Events",
      value: fmt(stats?.totalEvents),
    },
    {
      icon: Globe,
      color: "bg-green-600/80",
      label: "Published Events",
      value: fmt(stats?.publishedEvents),
    },
    {
      icon: Archive,
      color: "bg-slate-500/80",
      label: "Archived Events",
      value: fmt(stats?.archivedEvents),
    },
    {
      icon: GraduationCap,
      color: "bg-blue-600/80",
      label: "Students",
      value: fmt(stats?.totalStudents),
    },
    {
      icon: Megaphone,
      color: "bg-purple-600/80",
      label: "Organizers",
      value: fmt(stats?.totalOrganizers),
    },
    {
      icon: ClipboardList,
      color: "bg-amber-600/80",
      label: "Registrations",
      value: fmt(stats?.totalRegistrations),
    },
    {
      icon: Star,
      color: "bg-pink-600/80",
      label: "Reviews",
      value: fmt(stats?.totalReviews),
    },
    {
      icon: Building2,
      color: "bg-teal-600/80",
      label: "Departments",
      value: fmt(stats?.departments),
    },
  ];

  return (
    <div className="min-h-screen bg-surface-900 text-slate-100">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-brand-700/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-52 h-52 bg-brand-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            About Us
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
            Building the future of{" "}
            <span className="gradient-text">campus life</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            UniEvents is the all-in-one platform that connects students,
            organizers, and administrators — making it effortless to discover,
            create, and manage university events. Born from the idea that campus
            life should be vibrant, accessible, and well-organized for everyone.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Platform at a Glance
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Numbers that tell our story
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {statItems.map((item) => (
              <StatCard key={item.label} {...item} loading={loading} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission & Vision ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="glass-card p-8 sm:p-10 relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 0% 0%, rgba(109,58,255,0.12) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-brand-500/80 flex items-center justify-center mb-5">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Our Mission
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                  To empower every university community with a seamless,
                  intelligent platform that transforms how campus events are
                  discovered, organized, and experienced.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  We believe that every student deserves easy access to
                  opportunities — from hackathons and cultural fests to
                  workshops and leadership summits — without the chaos of
                  scattered notice boards and last-minute announcements.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="glass-card p-8 sm:p-10 relative overflow-hidden">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse at 100% 100%, rgba(168,85,247,0.12) 0%, transparent 60%)",
                }}
              />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/80 flex items-center justify-center mb-5">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Our Vision
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4">
                  A world where every campus is a thriving ecosystem of ideas,
                  creativity, and collaboration — powered by technology that
                  brings people together.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  We envision UniEvents becoming the standard for university
                  event management across institutions, creating connected
                  communities where no student is left out and every organizer
                  is empowered to create something extraordinary.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">
              What drives us
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Our core values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCard
              icon={Users}
              color="bg-brand-500/80"
              title="Community First"
              description="Everything we build starts with the student experience. We design for real campus needs, not theoretical ones."
            />
            <ValueCard
              icon={Sparkles}
              color="bg-purple-600/80"
              title="Quality Over Quantity"
              description="Every event goes through approval. We ensure students only see verified, well-organized events — no noise, no spam."
            />
            <ValueCard
              icon={Heart}
              color="bg-pink-600/80"
              title="Inclusivity"
              description="UniEvents is built for every student, every department, and every type of event. Campus life belongs to everyone."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card p-10 sm:p-12 relative overflow-hidden border-brand-500/20">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(109,58,255,0.18) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to be part of the story?
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                Join UniEvents today and experience campus life like never
                before.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="button-primary px-8 py-3.5 text-base w-full sm:w-auto"
                >
                  Join for free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/events"
                  className="button-ghost px-8 py-3.5 text-base w-full sm:w-auto"
                >
                  Browse events
                </Link>
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
