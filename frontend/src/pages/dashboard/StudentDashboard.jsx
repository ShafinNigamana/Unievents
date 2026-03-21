import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, TrendingUp, Archive, ArrowRight,
  Sparkles, Clock, Bookmark
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import EventCard from "../../components/ui/EventCard";
import { SkeletonGrid } from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className={`glass-card p-5 flex items-center gap-4 border ${bg}`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value ?? "—"}</p>
        <p className="text-xs text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [archived, setArchived] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [pubRes, archRes, savedRes] = await Promise.allSettled([
          api.get("/events"),
          api.get("/events/archive"),
          api.get("/users/saved-events"),
        ]);

        const pubData = pubRes.status === "fulfilled"
          ? (pubRes.value.data?.data ?? []) : [];
        const archData = archRes.status === "fulfilled"
          ? (archRes.value.data?.data ?? []) : [];
        const savedData = savedRes.status === "fulfilled"
          ? (savedRes.value.data?.data ?? []) : [];

        setEvents(pubData);
        setArchived(archData);
        setSaved(savedData);
      } catch {
        setError("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // When a card is unsaved from dashboard, remove it from saved list
  const handleSaveToggle = (eventId, newSavedState) => {
    if (!newSavedState) {
      setSaved((prev) => prev.filter((e) => e._id !== eventId));
    }
  };

  const savedEventIds = saved.map((e) => e._id);

  // Upcoming = events whose date is in the future
  const now = new Date();
  const upcoming = events.filter(
    (e) => e.eventDate && new Date(e.eventDate) >= now
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 p-8"
          style={{ background: "linear-gradient(135deg, #1a0a3e 0%, #14142b 60%, #0d1a3a 100%)" }}>

          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-brand-500/10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-purple-600/10 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" style={{ color: "#a78bfa" }} />
              <span className="text-sm font-medium" style={{ color: "#d8b4fe" }}>Student Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1" style={{ color: "#ffffff" }}>
              {greeting()}, {user?.name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-sm sm:text-base" style={{ color: "#94a3b8" }}>
              Stay updated with campus events and activities.
            </p>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp} label="Published Events"
              value={events.length}
              color="bg-brand-500/80" bg="border-brand-500/20"
            />
            <StatCard
              icon={Clock} label="Upcoming"
              value={upcoming.length}
              color="bg-purple-600/80" bg="border-purple-500/20"
            />
            <StatCard
              icon={Archive} label="Archived"
              value={archived.length}
              color="bg-blue-600/80" bg="border-blue-500/20"
            />
            <StatCard
              icon={Bookmark} label="Saved"
              value={saved.length}
              color="bg-brand-600/80" bg="border-brand-500/20"
            />
          </div>
        )}

        {/* Upcoming events section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              <h2>Upcoming Events</h2>
            </div>
            <button
              onClick={() => navigate("/events")}
              className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
            >
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <SkeletonGrid count={3} />
          ) : error ? (
            <div className="glass-card p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : upcoming.length === 0 ? (
            <div className="glass-card p-12 text-center space-y-2">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400">No upcoming events right now.</p>
              <button
                onClick={() => navigate("/events/archive")}
                className="button-ghost text-sm mt-2"
              >
                <Archive className="w-4 h-4" /> Browse archived events
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcoming.slice(0, 6).map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  savedEventIds={savedEventIds}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          )}
        </section>

        {/* Saved events section */}
        {!loading && saved.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-brand-400" />
                <h2>Saved Events</h2>
              </div>
              <button
                onClick={() => navigate("/saved-events")}
                className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {saved.slice(0, 3).map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  savedEventIds={savedEventIds}
                  onSaveToggle={handleSaveToggle}
                  allowUnsave={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Archived section (compact) */}
        {!loading && archived.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-blue-400" />
                <h2 className="text-blue-300">Recently Archived</h2>
              </div>
              <button
                onClick={() => navigate("/events/archive")}
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {archived.slice(0, 3).map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  savedEventIds={savedEventIds}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </Layout>
  );
}