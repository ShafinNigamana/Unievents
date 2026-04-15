import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Search, Filter, X, SlidersHorizontal,
  TrendingUp, Clock, Inbox
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import EventCard from "../../components/ui/EventCard";
import { SkeletonGrid } from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

const CATEGORIES = [
  "All", "Technical", "Cultural", "Sports", "Academic",
  "Workshop", "Seminar", "Conference", "Social", "Other"
];

export default function Events({ archive = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [year, setYear] = useState("All");
  const [years, setYears] = useState([]);

  // Saved state — only fetched for students
  const [savedEventIds, setSavedEventIds] = useState([]);

  const fetchSavedIds = useCallback(async () => {
    if (!isStudent) return;
    try {
      const res = await api.get("/users/saved-events");
      setSavedEventIds((res.data?.data ?? []).map((e) => e._id));
    } catch {
      // non-critical — silently fail
    }
  }, [isStudent]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (category !== "All") params.category = category;
      if (year !== "All") params.year = year;
      if (search.trim()) params.search = search.trim();

      const endpoint = archive ? "/events/archive" : "/events";
      const res = await api.get(endpoint, { params });
      const data = res.data?.data ?? [];
      setEvents(data);

      const uniqueYears = [
        ...new Set(
          data
            .map((e) => e.eventDate ? new Date(e.eventDate).getFullYear() : null)
            .filter(Boolean)
        ),
      ].sort((a, b) => b - a);
      setYears(uniqueYears);
    } catch {
      setError("Failed to load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category, year, search, archive]);

  useEffect(() => {
    fetchEvents();
    fetchSavedIds();
  }, [fetchEvents, fetchSavedIds]);

  // Keep savedEventIds in sync when student toggles save on a card
  const handleSaveToggle = (eventId, newSavedState) => {
    setSavedEventIds((prev) =>
      newSavedState
        ? [...prev, eventId]
        : prev.filter((id) => id !== eventId)
    );
  };

  const clearFilters = () => { setSearch(""); setCategory("All"); setYear("All"); };
  const hasFilters = search || category !== "All" || year !== "All";

  return (
    <Layout>
      <div className="space-y-7 animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${archive ? "bg-blue-600/20" : "bg-brand-600/20"}`}>
              {archive
                ? <Clock className="w-5 h-5 text-blue-400" />
                : <TrendingUp className="w-5 h-5 text-brand-400" />
              }
            </div>
            <div>
              <h1 className={`mb-0.5 ${archive ? "text-blue-300" : ""}`}>
                {archive ? "Archived Events" : "Upcoming Events"}
              </h1>
              <p className="text-xs text-slate-500">
                {archive
                  ? "Browse past events from previous semesters"
                  : "Discover and explore published campus events"}
              </p>
            </div>
          </div>

          {/* Count badge */}
          {!loading && (
            <span className="self-start sm:self-auto text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {events.length} {events.length === 1 ? "event" : "events"}
            </span>
          )}
        </div>

        {/* ── Filters bar ── */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-3 flex flex-col sm:flex-row gap-2.5">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, description, tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 py-2.5 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category select */}
          <div className="relative sm:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="select pl-9 py-2.5 appearance-none cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Year select */}
          <div className="relative sm:w-36">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="select pl-9 py-2.5 appearance-none cursor-pointer"
            >
              <option value="All">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <SkeletonGrid count={6} />
        ) : error ? (
          <div className="text-center py-20 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-red-400">{error}</p>
            <button onClick={fetchEvents} className="button-ghost text-sm">Retry</button>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto">
              <Inbox className="w-7 h-7 text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {hasFilters ? "No events match your filters" : "No events found"}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="button-ghost text-sm">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                savedEventIds={savedEventIds}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}