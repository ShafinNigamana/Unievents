import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Hash, Calendar, Bookmark,
    ClipboardList, Heart, Star, ArrowRight,
    Loader2, AlertCircle, CheckCircle2, Archive,
    GraduationCap, Clock
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import StarRating from "../../components/ui/StarRating";
import { SkeletonGrid } from "../../components/ui/Spinner";
import api from "../../services/api";

/* ── Stat card ───────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, border }) {
    return (
        <div className={`glass-card p-5 flex items-center gap-4 border ${border}`}>
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-2xl font-bold text-white leading-none">{value ?? 0}</p>
                <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
        </div>
    );
}

/* ── Section header ──────────────────────────── */
function SectionHeader({ icon: Icon, iconColor, title, count, to, navigate }) {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${iconColor}`} />
                <h2>{title}</h2>
                {count !== undefined && (
                    <span className="text-sm text-slate-500 ml-1">({count})</span>
                )}
            </div>
            {to && (
                <button
                    onClick={() => navigate(to)}
                    className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                    View all <ArrowRight className="w-4 h-4" />
                </button>
            )}
        </div>
    );
}

/* ── Compact event tile ──────────────────────── */
function EventTile({ event, onClick, badge }) {
    if (!event) return null;
    return (
        <div
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8
                 hover:border-brand-500/30 hover:bg-white/8 cursor-pointer transition-all group"
        >
            {/* Poster thumbnail */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-600/20 to-purple-600/20">
                {event.posterUrl ? (
                    <img src={event.posterUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-brand-500/30" />
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white group-hover:text-brand-300 transition-colors truncate">
                    {event.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    {event.category && (
                        <span className="text-[11px] text-slate-500">{event.category}</span>
                    )}
                    {event.eventDate && (
                        <span className="text-[11px] text-slate-600">
                            · {new Date(event.eventDate).toLocaleDateString("en-IN", {
                                day: "numeric", month: "short", year: "numeric",
                            })}
                        </span>
                    )}
                </div>
            </div>

            {/* Optional badge */}
            {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
    );
}

/* ── Empty section state ─────────────────────── */
function EmptySection({ message }) {
    return (
        <div className="py-8 text-center">
            <p className="text-slate-500 text-sm">{message}</p>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   STUDENT PROFILE PAGE
═══════════════════════════════════════════════ */
export default function StudentProfile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/users/me/profile");
            setProfile(res.data?.data);
        } catch {
            setError("Failed to load your profile. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    if (loading) {
        return (
            <Layout>
                <div className="space-y-8 animate-fade-in">
                    <div className="h-32 glass-card animate-pulse rounded-2xl" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 glass-card animate-pulse rounded-2xl" />
                        ))}
                    </div>
                    <SkeletonGrid count={3} />
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="text-center py-24 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-6 h-6 text-red-400" />
                    </div>
                    <p className="text-red-400">{error}</p>
                    <button onClick={fetchProfile} className="button-ghost text-sm">
                        Retry
                    </button>
                </div>
            </Layout>
        );
    }

    const { user, savedEvents, registeredEvents, interestedEvents, myReviews } = profile;

    const memberSince = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric",
        })
        : "—";

    return (
        <Layout>
            <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">

                {/* ── Profile Hero Card ── */}
                <div
                    className="relative overflow-hidden rounded-2xl border border-white/10 p-8"
                    style={{ background: "linear-gradient(135deg, #1a0a3e 0%, #14142b 60%, #0d1a3a 100%)" }}
                >
                    <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-brand-500/10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-purple-600/10 pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-glow">
                            {user.name
                                ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                                : "ST"}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-1">
                                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                    {user.role}
                                </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 mt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <Mail className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                    {user.email}
                                </div>
                                {user.enrollmentId && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Hash className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                        {user.enrollmentId}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                    <GraduationCap className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                                    Member since {memberSince}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Activity Stats ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                        icon={Bookmark} label="Saved Events"
                        value={savedEvents.length}
                        color="bg-brand-600/80" border="border-brand-500/20"
                    />
                    <StatCard
                        icon={ClipboardList} label="Registered"
                        value={registeredEvents.length}
                        color="bg-green-600/80" border="border-green-500/20"
                    />
                    <StatCard
                        icon={Heart} label="Interested"
                        value={interestedEvents.length}
                        color="bg-pink-600/80" border="border-pink-500/20"
                    />
                    <StatCard
                        icon={Star} label="Reviews Given"
                        value={myReviews.length}
                        color="bg-amber-600/80" border="border-amber-500/20"
                    />
                </div>

                {/* ── Registered Events ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={ClipboardList} iconColor="text-green-400"
                        title="Registered Events"
                        count={registeredEvents.length}
                        to="/my-registrations"
                        navigate={navigate}
                    />
                    {registeredEvents.length === 0 ? (
                        <EmptySection message="You haven't registered for any events yet." />
                    ) : (
                        <div className="space-y-2">
                            {registeredEvents.slice(0, 5).map(({ registration, event }) => (
                                <EventTile
                                    key={registration._id}
                                    event={event}
                                    onClick={() => navigate(`/events/${event._id}`)}
                                    badge={
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/25">
                                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                                            <span className="text-[11px] text-green-400 font-medium">Registered</span>
                                        </div>
                                    }
                                />
                            ))}
                            {registeredEvents.length > 5 && (
                                <button
                                    onClick={() => navigate("/my-registrations")}
                                    className="w-full text-xs text-slate-500 hover:text-brand-400 transition-colors pt-2"
                                >
                                    +{registeredEvents.length - 5} more registrations
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Saved Events ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={Bookmark} iconColor="text-brand-400"
                        title="Saved Events"
                        count={savedEvents.length}
                        to="/saved-events"
                        navigate={navigate}
                    />
                    {savedEvents.length === 0 ? (
                        <EmptySection message="You haven't saved any events yet." />
                    ) : (
                        <div className="space-y-2">
                            {savedEvents.slice(0, 5).map((event) => (
                                <EventTile
                                    key={event._id}
                                    event={event}
                                    onClick={() => navigate(`/events/${event._id}`)}
                                    badge={
                                        event.status === "archived" && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25">
                                                <Archive className="w-3 h-3 text-blue-400" />
                                                <span className="text-[11px] text-blue-400 font-medium">Archived</span>
                                            </div>
                                        )
                                    }
                                />
                            ))}
                            {savedEvents.length > 5 && (
                                <button
                                    onClick={() => navigate("/saved-events")}
                                    className="w-full text-xs text-slate-500 hover:text-brand-400 transition-colors pt-2"
                                >
                                    +{savedEvents.length - 5} more saved events
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* ── Interested Events ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={Heart} iconColor="text-pink-400"
                        title="Interested Events"
                        count={interestedEvents.length}
                    />
                    {interestedEvents.length === 0 ? (
                        <EmptySection message="You haven't marked interest in any events yet." />
                    ) : (
                        <div className="space-y-2">
                            {interestedEvents.slice(0, 5).map((event) => (
                                <EventTile
                                    key={event._id}
                                    event={event}
                                    onClick={() => navigate(`/events/${event._id}`)}
                                    badge={
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/15 border border-pink-500/25">
                                            <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
                                            <span className="text-[11px] text-pink-400 font-medium">
                                                {event.interestedCount ?? 0} interested
                                            </span>
                                        </div>
                                    }
                                />
                            ))}
                            {interestedEvents.length > 5 && (
                                <p className="text-xs text-slate-600 text-center pt-2">
                                    +{interestedEvents.length - 5} more
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* ── My Reviews ── */}
                <section className="glass-card p-6">
                    <SectionHeader
                        icon={Star} iconColor="text-amber-400"
                        title="My Reviews"
                        count={myReviews.length}
                    />
                    {myReviews.length === 0 ? (
                        <EmptySection message="You haven't reviewed any events yet." />
                    ) : (
                        <div className="space-y-3">
                            {myReviews.slice(0, 5).map((review) => (
                                <div
                                    key={review._id}
                                    onClick={() => navigate(`/events/${review.eventId._id}`)}
                                    className="p-4 rounded-xl bg-white/5 border border-white/8
                             hover:border-amber-500/20 cursor-pointer transition-all group"
                                >
                                    {/* Event info row */}
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <p className="text-sm font-medium text-white group-hover:text-amber-300 transition-colors truncate">
                                            {review.eventId.title}
                                        </p>
                                        <span className="text-[11px] text-slate-600 whitespace-nowrap flex-shrink-0">
                                            {new Date(review.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    {/* Stars */}
                                    <StarRating rating={review.rating} size={14} readonly />

                                    {/* Comment */}
                                    {review.comment && (
                                        <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                            "{review.comment}"
                                        </p>
                                    )}
                                </div>
                            ))}
                            {myReviews.length > 5 && (
                                <p className="text-xs text-slate-600 text-center pt-1">
                                    +{myReviews.length - 5} more reviews
                                </p>
                            )}
                        </div>
                    )}
                </section>

            </div>
        </Layout>
    );
}