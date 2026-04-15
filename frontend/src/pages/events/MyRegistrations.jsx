import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList, CheckCircle2, XCircle, Inbox,
    Calendar, MapPin, Clock, ArrowRight, Loader2
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { SkeletonGrid } from "../../components/ui/Spinner";
import api from "../../services/api";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

function StatusBadge({ status }) {
    if (status === "registered") {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/25">
                <CheckCircle2 className="w-3 h-3" />
                Registered
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/25">
            <XCircle className="w-3 h-3" />
            Cancelled
        </span>
    );
}

function RegistrationCard({ registration, onCancel, cancelling }) {
    const navigate = useNavigate();
    const event = registration.eventId;

    if (!event) return null;

    const isRegistered = registration.status === "registered";
    const isPublished = event.status === "published";
    const canCancel = isRegistered && isPublished;

    return (
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-5 flex flex-col gap-4 hover:border-brand-500/20 transition-all duration-200">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3
                        onClick={() => navigate(`/events/${event._id}`)}
                        className="text-sm font-semibold text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-300 transition-colors cursor-pointer line-clamp-2 leading-snug mb-1"
                    >
                        {event.title}
                    </h3>
                    {event.category && (
                        <span className="text-xs text-slate-500">{event.category}</span>
                    )}
                </div>
                <StatusBadge status={registration.status} />
            </div>

            {/* Meta */}
            <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                    <span>{formatDate(event.eventDate)}</span>
                    {event.startTime && (
                        <>
                            <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-1" />
                            <span>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</span>
                        </>
                    )}
                </div>
                {event.venue && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${event.venue === "To be announced" ? "text-amber-400" : "text-brand-400"}`} />
                        <span className={event.venue === "To be announced" ? "text-amber-400/80 italic" : "truncate"}>
                            {event.venue}
                        </span>
                    </div>
                )}
            </div>

            {/* Registered at */}
            <p className="text-[11px] text-slate-600">
                Registered on {formatDate(registration.registeredAt)}
                {registration.cancelledAt && (
                    <span> · Cancelled on {formatDate(registration.cancelledAt)}</span>
                )}
            </p>

            {/* Footer row */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5">
                <button
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                    View event <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {canCancel && (
                    <button
                        onClick={() => onCancel(registration)}
                        disabled={cancelling === registration._id}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                        {cancelling === registration._id
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <XCircle className="w-3.5 h-3.5" />
                        }
                        Cancel
                    </button>
                )}
            </div>
        </div>
    );
}

export default function MyRegistrations() {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancelling, setCancelling] = useState(null); // registration._id being cancelled
    const [filter, setFilter] = useState("all"); // "all" | "registered" | "cancelled"

    const fetchRegistrations = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/users/registrations");
            setRegistrations(res.data?.data ?? []);
        } catch {
            setError("Failed to load registrations. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handleCancel = async (registration) => {
        const eventId = registration.eventId?._id;
        if (!eventId) return;

        setCancelling(registration._id);
        try {
            await api.delete(`/events/${eventId}/register`);
            // Update local state — mark as cancelled
            setRegistrations((prev) =>
                prev.map((r) =>
                    r._id === registration._id
                        ? { ...r, status: "cancelled", cancelledAt: new Date().toISOString() }
                        : r
                )
            );
        } catch (err) {
            alert(err.response?.data?.error || "Cancellation failed.");
        } finally {
            setCancelling(null);
        }
    };

    const filtered = registrations.filter((r) => {
        if (filter === "registered") return r.status === "registered";
        if (filter === "cancelled") return r.status === "cancelled";
        return true;
    });

    const activeCount = registrations.filter((r) => r.status === "registered").length;
    const cancelledCount = registrations.filter((r) => r.status === "cancelled").length;

    return (
        <Layout>
            <div className="space-y-7 animate-fade-in">

                {/* Page header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-brand-600/20">
                            <ClipboardList className="w-5 h-5 text-brand-400" />
                        </div>
                        <div>
                            <h1 className="mb-0.5">My Registrations</h1>
                            <p className="text-xs text-slate-500">
                                Events you have registered for
                            </p>
                        </div>
                    </div>

                    {/* Count badge */}
                    {!loading && (
                        <span className="self-start sm:self-auto text-xs font-medium px-3 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {activeCount} active · {cancelledCount} cancelled
                        </span>
                    )}
                </div>

                {/* Filter tabs */}
                {!loading && registrations.length > 0 && (
                    <div className="flex items-center gap-2">
                        {[
                            { key: "all", label: `All (${registrations.length})` },
                            { key: "registered", label: `Registered (${activeCount})` },
                            { key: "cancelled", label: `Cancelled (${cancelledCount})` },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all duration-200
                  ${filter === tab.key
                                        ? "bg-brand-500/20 border-brand-500/40 text-brand-600 dark:text-brand-300"
                                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <SkeletonGrid count={4} />
                ) : error ? (
                    <div className="text-center py-20 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
                            <ClipboardList className="w-6 h-6 text-red-400" />
                        </div>
                        <p className="text-red-400">{error}</p>
                        <button onClick={fetchRegistrations} className="button-ghost text-sm">
                            Retry
                        </button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center mx-auto">
                            <Inbox className="w-7 h-7 text-slate-500" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {filter === "all"
                                ? "No registrations yet"
                                : `No ${filter} registrations`}
                        </p>
                        {filter === "all" && (
                            <p className="text-slate-500 text-sm">
                                Browse events and register to see them here
                            </p>
                        )}
                        {filter !== "all" && (
                            <button onClick={() => setFilter("all")} className="button-ghost text-sm">
                                View all registrations
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {filtered.map((registration) => (
                            <RegistrationCard
                                key={registration._id}
                                registration={registration}
                                onCancel={handleCancel}
                                cancelling={cancelling}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}