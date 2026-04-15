import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Edit2, Trash2, FileText, Clock, Calendar,
  CheckCircle2, Archive, TrendingUp, LayoutDashboard,
  ChevronRight, AlertCircle, Loader2, Star,
  Users, X, Mail, Hash, UserCheck
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { SkeletonGrid } from "../../components/ui/Spinner";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

/* ── Stat card ─────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, border }) {
  return (
    <div className={`bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-5 flex items-center gap-4 ${border}`}>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{value ?? 0}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ── Action button ──────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, variant = "ghost", disabled = false }) {
  const cls = {
    ghost: "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10",
    brand: "text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-500/10",
    danger: "text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10",
    success: "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-500/10",
    info: "text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  transition-all ${cls[variant]} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

/* ── Attendees Modal ────────────────────────── */
function AttendeesModal({ event, onClose }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!event) return;
    const fetchAttendees = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/events/${event._id}/attendees`);
        setAttendees(res.data?.data ?? []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load attendees.");
      } finally {
        setLoading(false);
      }
    };
    fetchAttendees();
  }, [event]);

  const capacity = event?.capacity ?? null;
  const registered = event?.registeredCount ?? 0;

  return (
    <Modal
      isOpen={!!event}
      onClose={onClose}
      title={`Attendees — ${event?.title ?? ""}`}
    >
      {/* Capacity bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">
            {registered} registered
            {capacity ? ` of ${capacity} capacity` : " (no capacity limit)"}
          </span>
          {capacity && (
            <span className={`font-semibold ${registered >= capacity ? "text-red-400" : "text-green-400"}`}>
              {capacity - registered >= 0 ? capacity - registered : 0} spots left
            </span>
          )}
        </div>
        {capacity && (
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${registered >= capacity ? "bg-red-500" : "bg-green-500"
                }`}
              style={{ width: `${Math.min(100, (registered / capacity) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-red-400 text-sm text-center py-8">{error}</p>
      ) : attendees.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 text-sm">No registrations yet.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {attendees.map((reg, i) => {
            const u = reg.userId;
            return (
              <div
                key={reg._id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/8"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {u?.name
                    ? u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                    : String(i + 1).padStart(2, "0")}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {u?.name ?? "—"}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {u?.email && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Mail className="w-3 h-3" />
                        {u.email}
                      </span>
                    )}
                    {u?.enrollmentId && (
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Hash className="w-3 h-3" />
                        {u.enrollmentId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Registered date */}
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-slate-500">
                    {reg.registeredAt
                      ? new Date(reg.registeredAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short",
                      })
                      : "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export hint */}
      {!loading && attendees.length > 0 && (
        <p className="text-[11px] text-slate-600 mt-4 text-center">
          {attendees.length} attendee{attendees.length !== 1 ? "s" : ""} registered
        </p>
      )}

      {/* Close */}
      <div className="flex justify-end mt-5">
        <button onClick={onClose} className="button-ghost py-2 px-4 text-sm">
          Close
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════
   ORGANIZER DASHBOARD
═══════════════════════════════════════════════ */
export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Attendees modal
  const [attendeesEvent, setAttendeesEvent] = useState(null);

  // Status change loading
  const [statusLoading, setStatusLoading] = useState(null);

  /* ── Fetch my events ─── */
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/events/my");
      setEvents(res.data?.data ?? []);
    } catch {
      setError("Failed to load your events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  /* ── Stats ─── */
  const counts = {
    total: events.length,
    draft: events.filter((e) => e.status === "draft").length,
    pending: events.filter((e) => e.approvalStatus === "pending" && e.status === "draft").length,
    approved: events.filter((e) => e.approvalStatus === "approved" && e.status === "draft").length,
    published: events.filter((e) => e.status === "published").length,
    archived: events.filter((e) => e.status === "archived").length,
  };

  /* ── Soft delete ─── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/events/${deleteTarget._id}`);
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  /* ── Publish ─── */
  const handlePublish = async (event) => {
    setStatusLoading(event._id);
    try {
      await api.patch(`/events/${event._id}/status`, { status: "published" });
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || "Could not publish.");
    } finally {
      setStatusLoading(null);
    }
  };

  /* ── Format date ─── */
  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    }) : "—";

  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-brand-400" />
              <h1>Organizer Dashboard</h1>
            </div>
            <p>Manage your events — create, edit, publish, and view attendees.</p>
          </div>
          <button
            onClick={() => navigate("/events/new")}
            className="button-primary"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={FileText} label="Total" value={counts.total} color="bg-slate-600" border="border-white/10" />
            <StatCard icon={Clock} label="Drafts" value={counts.draft} color="bg-slate-500/80" border="border-white/10" />
            <StatCard icon={AlertCircle} label="Pending" value={counts.pending} color="bg-amber-600/80" border="border-amber-500/20" />
            <StatCard icon={TrendingUp} label="Published" value={counts.published} color="bg-brand-600/80" border="border-brand-500/20" />
            <StatCard icon={Archive} label="Archived" value={counts.archived} color="bg-blue-600/80" border="border-blue-500/20" />
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-white/8 flex items-center justify-between">
            <h2 className="text-base font-semibold">My Events</h2>
            <span className="text-sm text-slate-500">{events.length} events</span>
          </div>

          {loading ? (
            <div className="p-6"><SkeletonGrid count={3} /></div>
          ) : error ? (
            <div className="p-10 text-center">
              <p className="text-red-400">{error}</p>
              <button onClick={fetchEvents} className="button-ghost mt-3 text-sm">Retry</button>
            </div>
          ) : events.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400">No events yet.</p>
              <button onClick={() => navigate("/events/new")} className="button-primary text-sm">
                <Plus className="w-4 h-4" /> Create your first event
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/8 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-medium">Event</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Rating</th>
                    <th className="text-left px-4 py-3 font-medium">Registered</th>
                    <th className="text-left px-4 py-3 font-medium">Approval</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Title + poster thumbnail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-100 dark:from-brand-600/20 to-purple-100 dark:to-purple-600/20">
                            {event.posterUrl ? (
                              <img src={event.posterUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-brand-300 dark:text-brand-500/40" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white text-sm leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors truncate">
                              {event.title}
                            </p>
                            {event.category && (
                              <p className="text-xs text-slate-500 mt-0.5">{event.category}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        {fmtDate(event.eventDate)}
                        {event.endDate && (
                          <span className="text-slate-500"> – {fmtDate(event.endDate)}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge type="status" value={event.status} />
                      </td>

                      {/* Rating */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {event.reviewCount > 0 ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 w-fit">
                            <Star size={10} className="text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                            <span className="font-bold text-amber-700 dark:text-amber-300">{event.averageRating}</span>
                            <span className="text-amber-500/60 dark:text-amber-300/60 font-medium">({event.reviewCount})</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Registered count */}
                      <td className="px-4 py-4 whitespace-nowrap text-xs">
                        {(event.status === "published" || event.status === "archived") ? (
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-green-400" />
                            <span className="text-green-700 dark:text-green-300 font-medium">
                              {event.registeredCount ?? 0}
                              {event.capacity
                                ? <span className="text-slate-500"> / {event.capacity}</span>
                                : null}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Approval */}
                      <td className="px-4 py-4">
                        <Badge type="approval" value={event.approvalStatus} />
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end flex-wrap">
                          {/* View */}
                          <ActionBtn
                            icon={ChevronRight}
                            label="View"
                            onClick={() => navigate(`/events/${event._id}`)}
                          />

                          {/* Attendees — published or archived only */}
                          {(event.status === "published" || event.status === "archived") && (
                            <ActionBtn
                              icon={Users}
                              label="Attendees"
                              variant="info"
                              onClick={() => setAttendeesEvent(event)}
                            />
                          )}

                          {/* Edit — not allowed if archived */}
                          {event.status !== "archived" && (
                            <ActionBtn
                              icon={Edit2}
                              label="Edit"
                              variant="brand"
                              onClick={() => navigate(`/events/${event._id}/edit`)}
                            />
                          )}

                          {/* Publish — only if approved draft */}
                          {event.status === "draft" && event.approvalStatus === "approved" && (
                            <ActionBtn
                              icon={statusLoading === event._id ? Loader2 : TrendingUp}
                              label="Publish"
                              variant="success"
                              onClick={() => handlePublish(event)}
                              disabled={statusLoading === event._id}
                            />
                          )}

                          {/* Delete — not allowed if archived */}
                          {event.status !== "archived" && (
                            <ActionBtn
                              icon={Trash2}
                              label="Delete"
                              variant="danger"
                              onClick={() => setDeleteTarget(event)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Mobile card view */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-white/8">
                {events.map((event) => (
                  <div key={event._id} className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-brand-100 dark:from-brand-600/20 to-purple-100 dark:to-purple-600/20">
                        {event.posterUrl ? (
                          <img src={event.posterUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-brand-300 dark:text-brand-500/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{event.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{fmtDate(event.eventDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge type="status" value={event.status} />
                      <Badge type="approval" value={event.approvalStatus} />
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      <ActionBtn icon={ChevronRight} label="View" onClick={() => navigate(`/events/${event._id}`)} />
                      {(event.status === "published" || event.status === "archived") && (
                        <ActionBtn icon={Users} label="Attendees" variant="info" onClick={() => setAttendeesEvent(event)} />
                      )}
                      {event.status !== "archived" && (
                        <ActionBtn icon={Edit2} label="Edit" variant="brand" onClick={() => navigate(`/events/${event._id}/edit`)} />
                      )}
                      {event.status === "draft" && event.approvalStatus === "approved" && (
                        <ActionBtn icon={statusLoading === event._id ? Loader2 : TrendingUp} label="Publish" variant="success" onClick={() => handlePublish(event)} disabled={statusLoading === event._id} />
                      )}
                      {event.status !== "archived" && (
                        <ActionBtn icon={Trash2} label="Delete" variant="danger" onClick={() => setDeleteTarget(event)} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Approval info banners */}
        {counts.pending > 0 && (
          <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-4 flex items-center gap-3 border-amber-500/20">
            <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <span className="font-semibold">
                {counts.pending} event{counts.pending > 1 ? "s are" : " is"} waiting for admin approval.
              </span>
              {" "}You can publish once approved.
            </p>
          </div>
        )}
        {counts.approved > 0 && (
          <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-4 flex items-center gap-3 border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-300">
              <span className="font-semibold">
                {counts.approved} event{counts.approved > 1 ? "s are" : " is"} approved
              </span>
              {" "}and ready to publish — click Publish in the table above.
            </p>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Event"
        danger
      >
        <p className="text-sm text-slate-300 mb-2">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-white">"{deleteTarget?.title}"</span>?
        </p>
        <p className="text-xs text-slate-500 mb-6">
          The event will be soft-deleted and can be restored by an admin.
        </p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteTarget(null)} className="button-ghost py-2 px-4 text-sm">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="button-danger py-2 px-4 text-sm"
          >
            {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : "Delete"}
          </button>
        </div>
      </Modal>

      {/* Attendees modal */}
      <AttendeesModal
        event={attendeesEvent}
        onClose={() => setAttendeesEvent(null)}
      />
    </Layout>
  );
}