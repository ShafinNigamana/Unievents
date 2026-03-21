import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Inbox, Loader2 } from "lucide-react";
import Layout from "../../components/layout/Layout";
import EventCard from "../../components/ui/EventCard";
import { SkeletonGrid } from "../../components/ui/Spinner";
import api from "../../services/api";

export default function SavedEvents() {
    const navigate = useNavigate();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSavedEvents = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/users/saved-events");
            setEvents(res.data?.data ?? []);
        } catch {
            setError("Failed to load saved events. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSavedEvents();
    }, [fetchSavedEvents]);

    // When a card is unsaved from this page, remove it from the list
    const handleSaveToggle = (eventId, newSavedState) => {
        if (!newSavedState) {
            setEvents((prev) => prev.filter((e) => e._id !== eventId));
        }
    };

    const savedEventIds = events.map((e) => e._id);

    return (
        <Layout>
            <div className="space-y-7 animate-fade-in">

                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-600/20">
                            <Bookmark className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="mb-0.5">Saved Events</h1>
                            <p className="text-xs text-slate-500">
                                Events you've bookmarked for later
                            </p>
                        </div>
                    </div>

                    {/* Count badge */}
                    {!loading && (
                        <span className="self-start sm:self-auto text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 whitespace-nowrap">
                            {events.length} {events.length === 1 ? "event" : "events"} saved
                        </span>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <SkeletonGrid count={6} />
                ) : error ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
                            <Bookmark className="w-6 h-6 text-red-400" />
                        </div>
                        <p className="text-red-400">{error}</p>
                        <button onClick={fetchSavedEvents} className="button-ghost text-sm">
                            Retry
                        </button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                            <Inbox className="w-7 h-7 text-slate-500" />
                        </div>
                        <p className="text-slate-400 font-medium">No saved events yet</p>
                        <p className="text-slate-500 text-sm">
                            Browse events and click the bookmark icon to save them here
                        </p>
                        <button
                            onClick={() => navigate("/events")}
                            className="button-ghost text-sm mt-2"
                        >
                            Browse Events
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {events.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                savedEventIds={savedEventIds}
                                onSaveToggle={handleSaveToggle}
                                allowUnsave={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}