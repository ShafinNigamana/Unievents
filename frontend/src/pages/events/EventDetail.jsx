import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Calendar, MapPin, Clock, Tag, ArrowLeft,
    User, Archive, CheckCircle2, FileText
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import { PageLoader } from "../../components/ui/Spinner";
import api from "../../services/api";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
}

function MetaRow({ icon: Icon, label, value, color = "text-brand-400" }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3 border-b border-white/8 last:border-0">
            <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
            <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-white">{value}</p>
            </div>
        </div>
    );
}

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await api.get(`/events/${id}`);
                setEvent(res.data?.data);
            } catch {
                setError("Event not found or unavailable.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    if (loading) return <Layout><PageLoader /></Layout>;

    if (error || !event) {
        return (
            <Layout>
                <div className="text-center py-24 space-y-4">
                    <p className="text-red-400 text-lg">{error || "Event not found."}</p>
                    <button onClick={() => navigate(-1)} className="button-ghost">
                        <ArrowLeft className="w-4 h-4" /> Go back
                    </button>
                </div>
            </Layout>
        );
    }

    const timeDisplay =
        event.startTime && event.endTime ? `${event.startTime} – ${event.endTime}`
            : event.startTime ? event.startTime
                : null;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto animate-slide-up space-y-6">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to events
                </button>

                {/* Hero card */}
                <div className="glass-card p-8">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                        <Badge type="status" value={event.status} />
                        <Badge type="approval" value={event.approvalStatus} />
                        {event.category && (
                            <span className="inline-flex items-center gap-1 text-xs bg-brand-500/15 text-brand-300 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                                <Tag className="w-3 h-3" />
                                {event.category}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                        {event.title}
                    </h1>

                    {/* Tags */}
                    {event.tags?.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-6">
                            {event.tags.map((tag) => (
                                <span key={tag} className="text-xs text-slate-400 border border-white/10 px-2.5 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Meta grid */}
                    <div className="glass-card p-4 mb-6 divide-y divide-white/8">
                        <MetaRow icon={Calendar} label="Date" value={formatDate(event.eventDate)} />
                        <MetaRow icon={Clock} label="Time" value={timeDisplay} />
                        <MetaRow icon={MapPin} label="Venue" value={event.venue} />
                        <MetaRow icon={User} label="Organizer"
                            value={event.organizer?.name ?? event.organizer?.email ?? null}
                            color="text-purple-400"
                        />
                    </div>

                    {/* Description */}
                    {event.description && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wide">
                                <FileText className="w-3.5 h-3.5" />
                                About this event
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                                {event.description}
                            </p>
                        </div>
                    )}
                </div>

                {/* Archive notice */}
                {event.status === "archived" && (
                    <div className="glass-card p-4 flex items-center gap-3 border-blue-500/20">
                        <Archive className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        <p className="text-sm text-blue-300">
                            This event has been archived and is preserved for institutional records.
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
