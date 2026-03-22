import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Clock, Tag, ArrowRight, Star, Bookmark, Heart } from "lucide-react";
import Badge from "./Badge";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

function formatDateRange(start, end) {
  if (!start) return "—";
  const s = formatDate(start);
  if (!end) return s;
  const e = formatDate(end);
  return `${s} – ${e}`;
}

/**
 * EventCard
 *
 * Props:
 * - event         : event object
 * - onClick       : optional custom click handler
 * - savedEventIds : array of saved event _id strings (for bookmark state)
 * - onSaveToggle  : callback(eventId, newSavedState) when bookmark toggled
 * - allowUnsave   : boolean — when true, shows bookmark even on archived events
 */
export default function EventCard({
  event,
  onClick,
  savedEventIds = [],
  onSaveToggle,
  allowUnsave = false,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isStudent = user?.role === "student";
  const isPublished = event.status === "published";
  const isArchived = event.status === "archived";

  // Bookmark — student + published, or student + archived + allowUnsave
  const canSave = isStudent && (isPublished || (isArchived && allowUnsave));

  // Interest — students on published events only
  const canInterest = isStudent && isPublished;

  // ── Bookmark state ──
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Interest state ──
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(event.interestedCount ?? 0);
  const [interestLoading, setInterestLoading] = useState(false);

  // Sync bookmark from parent prop (handles async fetch)
  useEffect(() => {
    setIsSaved(savedEventIds.includes(event._id));
  }, [savedEventIds, event._id]);

  // Sync interest from event data
  useEffect(() => {
    if (user && Array.isArray(event.interestedUsers)) {
      setIsInterested(event.interestedUsers.includes(user.id));
    }
    setInterestCount(event.interestedCount ?? 0);
  }, [event.interestedUsers, event.interestedCount, user]);

  const handleClick = () => {
    if (onClick) {
      onClick(event);
      return;
    }
    navigate(`/events/${event._id}`);
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (saving) return;

    setSaving(true);
    const prev = isSaved;
    setIsSaved(!prev);

    try {
      await api.post(`/users/saved-events/${event._id}`);
      if (onSaveToggle) onSaveToggle(event._id, !prev);
    } catch {
      setIsSaved(prev);
    } finally {
      setSaving(false);
    }
  };

  const handleInterest = async (e) => {
    e.stopPropagation();
    if (interestLoading) return;

    setInterestLoading(true);
    const prev = isInterested;
    const prevCount = interestCount;

    // Optimistic update
    setIsInterested(!prev);
    setInterestCount(prev ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.post(`/events/${event._id}/interest`);
      // Sync with actual server values
      setIsInterested(res.data.interested);
      setInterestCount(res.data.interestedCount);
    } catch {
      // Revert on error
      setIsInterested(prev);
      setInterestCount(prevCount);
    } finally {
      setInterestLoading(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="glass-card flex flex-col cursor-pointer overflow-hidden
           group hover:border-brand-500/30 hover:shadow-glow-sm
           transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Poster image */}
      <div className="relative w-full h-40 bg-gradient-to-br from-brand-600/20 to-purple-600/20 overflow-hidden flex-shrink-0">
        {event.posterUrl ? (
          <img
            src={event.posterUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-brand-500/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e1a] via-transparent to-transparent" />

        {/* Bookmark button — top right of poster */}
        {canSave && (
          <button
            onClick={handleSave}
            disabled={saving}
            title={isSaved ? "Remove from saved" : "Save event"}
            className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-xl border backdrop-blur-sm
              transition-all duration-200
              ${isSaved
                ? "bg-brand-500/90 border-brand-400/50 text-white shadow-glow-sm"
                : "bg-black/40 border-white/20 text-slate-300 hover:bg-brand-500/80 hover:border-brand-400/50 hover:text-white"
              }
              ${saving ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            <Bookmark
              className="w-3.5 h-3.5"
              fill={isSaved ? "currentColor" : "transparent"}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Top row — badges + rating */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge type="status" value={event.status} />
            <Badge type="approval" value={event.approvalStatus} />
          </div>

          {event.reviewCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-bold text-amber-300">{event.averageRating}</span>
              <span className="text-[10px] text-amber-300/60">({event.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          className="text-base font-semibold text-white leading-snug
                   group-hover:text-brand-300 transition-colors line-clamp-2"
        >
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
            <span>{formatDateRange(event.eventDate, event.endDate)}</span>
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
              <MapPin
                className={`w-3.5 h-3.5 flex-shrink-0 ${event.venue === "To be announced" ? "text-amber-400" : "text-brand-400"
                  }`}
              />
              <span
                className={
                  event.venue === "To be announced"
                    ? "text-amber-400/80 italic"
                    : "truncate"
                }
              >
                {event.venue}
              </span>
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
              <span
                key={tag}
                className="text-xs text-slate-500 border border-white/10 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer row — interest button left, view details right */}
        <div className="flex items-center justify-between pt-1">

          {/* Interest button — students on published only */}
          {canInterest ? (
            <button
              onClick={handleInterest}
              disabled={interestLoading}
              title={isInterested ? "Remove interest" : "Mark as interested"}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                border transition-all duration-200
                ${isInterested
                  ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-pink-500/15 hover:border-pink-500/30 hover:text-pink-300"
                }
                ${interestLoading ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <Heart
                className="w-3 h-3"
                fill={isInterested ? "currentColor" : "transparent"}
              />
              <span>
                {interestCount > 0 ? interestCount : "Interested"}
              </span>
            </button>
          ) : (
            /* Non-students: show count only when > 0, no button */
            interestCount > 0 ? (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                <span>{interestCount}</span>
              </div>
            ) : (
              <div />
            )
          )}

          {/* View details */}
          <div className="flex items-center gap-1 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
}