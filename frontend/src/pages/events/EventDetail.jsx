import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Calendar, MapPin, Clock, Tag, ArrowLeft,
  User, Archive, FileText,
  Star as StarIcon, MessageSquare, Send, Trash2, Edit2, Loader2,
  Bookmark
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import { PageLoader } from "../../components/ui/Spinner";
import StarRating from "../../components/ui/StarRating";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateRange(start, end) {
  if (!start) return "—";
  const s = formatDate(start);
  if (!end) return s;
  const e = formatDate(end);
  return `${s} – ${e}`;
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
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Save state
  const isStudent = user?.role === "student";
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchEvent = useCallback(async () => {
    try {
      const res = await api.get(`/events/${id}`);
      setEvent(res.data?.data);
    } catch (err) {
      setError("Event not found or unavailable.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/reviews/events/${id}/reviews`);
      const allReviews = res.data?.data ?? [];
      setReviews(allReviews);

      if (user) {
        const found = allReviews.find(r => r.userId?._id === user.id || r.userId === user.id);
        if (found) {
          setUserReview(found);
          setRating(found.rating);
          setComment(found.comment || "");
        }
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id, user]);

  // Fetch initial saved state for student
  const fetchSavedState = useCallback(async () => {
    if (!isStudent) return;
    try {
      const res = await api.get("/users/saved-events");
      const savedIds = (res.data?.data ?? []).map((e) => e._id);
      setIsSaved(savedIds.includes(id));
    } catch {
      // silently fail — save state is non-critical
    }
  }, [id, isStudent]);

  useEffect(() => {
    fetchEvent();
    fetchReviews();
    fetchSavedState();
  }, [fetchEvent, fetchReviews, fetchSavedState]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const prev = isSaved;
    setIsSaved(!prev); // optimistic

    try {
      await api.post(`/users/saved-events/${id}`);
    } catch {
      setIsSaved(prev); // revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setFormError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      if (userReview && isEditing) {
        await api.put(`/reviews/${userReview._id}`, { rating, comment });
      } else {
        await api.post("/reviews", { eventId: id, rating, comment });
      }
      setIsEditing(false);
      fetchReviews();
      fetchEvent();
    } catch (err) {
      setFormError(err.response?.data?.error || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    if (!window.confirm("Are you sure you want to delete your review?")) return;

    setSubmitting(true);
    try {
      await api.delete(`/reviews/${userReview._id}`);
      setUserReview(null);
      setRating(0);
      setComment("");
      fetchReviews();
      fetchEvent();
    } catch (err) {
      alert("Failed to delete review.");
    } finally {
      setSubmitting(false);
    }
  };

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
    event.startTime && event.endTime
      ? `${event.startTime} – ${event.endTime}`
      : event.startTime
        ? event.startTime
        : null;

  const canSave = isStudent && event.status === "published";
  const canReview = isStudent && event.createdBy !== user.id && ["published", "archived"].includes(event.status);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto animate-slide-up space-y-6 pb-20">

        {/* Back + Save row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to events
          </button>

          {/* Save button — students + published only */}
          {canSave && (
            <button
              onClick={handleSave}
              disabled={saving}
              title={isSaved ? "Remove from saved" : "Save this event"}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium
                transition-all duration-200
                ${isSaved
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300 hover:bg-brand-500/30"
                  : "bg-white/5 border-white/10 text-slate-400 hover:bg-brand-500/15 hover:border-brand-500/30 hover:text-brand-300"
                }
                ${saving ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bookmark
                  className="w-4 h-4"
                  fill={isSaved ? "currentColor" : "transparent"}
                />
              )}
              {isSaved ? "Saved" : "Save Event"}
            </button>
          )}
        </div>

        {/* Hero card */}
        <div className="glass-card overflow-hidden">
          {/* Poster */}
          {event.posterUrl && (
            <div className="relative w-full max-h-80 overflow-hidden">
              <img
                src={event.posterUrl}
                alt={`${event.title} poster`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e1a] via-transparent to-transparent" />
            </div>
          )}

          <div className="p-8">
            {/* Badges + Rating Summary */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge type="status" value={event.status} />
                <Badge type="approval" value={event.approvalStatus} />
                {event.category && (
                  <span className="inline-flex items-center gap-1 text-xs bg-brand-500/15 text-brand-300 border border-brand-500/20 px-2.5 py-0.5 rounded-full">
                    <Tag className="w-3 h-3" />
                    {event.category}
                  </span>
                )}
              </div>

              {event.reviewCount > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={event.averageRating} size={16} />
                  <span className="text-sm font-bold text-white">{event.averageRating}</span>
                  <span className="text-xs text-slate-500">({event.reviewCount} reviews)</span>
                </div>
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
              <MetaRow icon={Calendar} label="Date" value={formatDateRange(event.eventDate, event.endDate)} />
              <MetaRow icon={Clock} label="Time" value={timeDisplay} />
              <MetaRow
                icon={MapPin}
                label="Venue"
                value={event.venue || null}
                color={event.venue === "To be announced" ? "text-amber-400" : "text-brand-400"}
              />
              <MetaRow
                icon={User}
                label="Organizer"
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

        {/* ── Reviews Section ── */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-bold text-white">Reviews</h2>
              <span className="text-sm text-slate-500 ml-1">({reviews.length})</span>
            </div>
          </div>

          {/* Submission Form */}
          {canReview && (!userReview || isEditing) && (
            <div className="glass-card p-6 border-brand-500/20 animate-fade-in">
              <h3 className="text-sm font-semibold text-white mb-4">
                {isEditing ? "Update your review" : "Rate this event"}
              </h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Rating</label>
                  <StarRating rating={rating} readonly={false} onChange={setRating} size={24} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Comment (Optional)</label>
                  <textarea
                    className="input min-h-[100px] resize-none"
                    placeholder="Share your experience with other students..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                  />
                </div>
                {formError && <p className="text-xs text-red-500">{formError}</p>}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="button-primary flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isEditing ? "Update Review" : "Submit Review"}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setRating(userReview.rating);
                        setComment(userReview.comment || "");
                      }}
                      className="button-ghost"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* User's Existing Review */}
          {userReview && !isEditing && (
            <div className="glass-card p-6 border-brand-500/30 bg-brand-500/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">Your Review</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Edit review"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Delete review"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <StarRating rating={userReview.rating} size={16} />
                <span className="text-xs text-slate-500">
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-slate-300 text-sm italic">"{userReview.comment || "No comment provided."}"</p>
            </div>
          )}

          {/* All Reviews List */}
          <div className="space-y-4">
            {reviewsLoading ? (
              <div className="text-center py-10">
                <Loader2 className="w-8 h-8 text-slate-700 animate-spin mx-auto" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-16 glass-card border-dashed">
                <StarIcon className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No reviews yet. Be the first to rate!</p>
              </div>
            ) : (
              reviews
                .filter(r => r._id !== userReview?._id)
                .map((r) => (
                  <div key={r._id} className="glass-card p-5 border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">
                        {r.userId?.name || "Anonymous Student"}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-2">
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    {r.comment && (
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}