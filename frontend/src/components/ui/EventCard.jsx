import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Tag, ArrowRight } from "lucide-react";
import Badge from "./Badge";

function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export default function EventCard({ event, onClick }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) { onClick(event); return; }
        navigate(`/events/${event._id}`);
    };

    return (
        <div
            onClick={handleClick}
            className="glass-card p-5 flex flex-col gap-3 cursor-pointer
                 group hover:border-brand-500/30 hover:shadow-glow-sm
                 transition-all duration-300 hover:-translate-y-0.5"
        >
            {/* Top row — badges */}
            <div className="flex items-center gap-2 flex-wrap">
                <Badge type="status" value={event.status} />
                <Badge type="approval" value={event.approvalStatus} />
            </div>

            {/* Title */}
            <h3 className="text-base font-semibold text-white leading-snug
                     group-hover:text-brand-300 transition-colors line-clamp-2">
                {event.title}
            </h3>

            {/* Description */}
            {event.description && (
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {event.description}
                </p>
            )}

            {/* Meta grid */}
            <div className="mt-auto space-y-1.5">
                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                    <span>{formatDate(event.eventDate)}</span>
                    {(event.startTime || event.endTime) && (
                        <>
                            <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 ml-2" />
                            <span>
                                {event.startTime ?? ""}
                                {event.startTime && event.endTime ? " – " : ""}
                                {event.endTime ?? ""}
                            </span>
                        </>
                    )}
                </div>

                {/* Venue */}
                {event.venue && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span className="truncate">{event.venue}</span>
                    </div>
                )}

                {/* Category + tags */}
                <div className="flex items-center gap-2 flex-wrap">
                    {event.category && (
                        <span className="inline-flex items-center gap-1 text-xs bg-brand-500/15 text-brand-300 border border-brand-500/20 px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" />
                            {event.category}
                        </span>
                    )}
                    {event.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-slate-500 border border-white/10 px-2 py-0.5 rounded-full">
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Footer CTA */}
            <div className="flex items-center gap-1 text-xs text-brand-400
                      opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                <span>View details</span>
                <ArrowRight className="w-3.5 h-3.5" />
            </div>
        </div>
    );
}
