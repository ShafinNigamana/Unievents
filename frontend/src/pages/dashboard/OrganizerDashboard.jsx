import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Edit2, Trash2, FileText, Clock,
  CheckCircle2, Archive, TrendingUp, LayoutDashboard,
  ChevronRight, AlertCircle, Loader2
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

/* ── Action button ──────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, variant = "ghost", disabled = false }) {
  const cls = {
    ghost: "text-slate-400 hover:text-white hover:bg-white/10",
    brand: "text-brand-400 hover:text-brand-300 hover:bg-brand-500/10",
    danger: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
    success: "text-green-400 hover:text-green-300 hover:bg-green-500/10",
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

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  /* ── Publish (status → published) ─── */
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
    d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

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
            <p>Manage your events — create, edit, publish, and delete.</p>
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
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 text-xs text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-6 py-3 font-medium">Event</th>
                    <th className="text-left px-4 py-3 font-medium">Date</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Approval</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((event) => (
                    <tr
                      key={event._id}
                      className="hover:bg-white/3 transition-colors group"
                    >
                      {/* Title + category */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-white text-sm leading-snug group-hover:text-brand-300 transition-colors">
                          {event.title}
                        </p>
                        {event.category && (
                          <p className="text-xs text-slate-500 mt-0.5">{event.category}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-slate-400 whitespace-nowrap">
                        {fmtDate(event.eventDate)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <Badge type="status" value={event.status} />
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
          )}
        </div>

        {/* Approval info banner */}
        {counts.pending > 0 && (
          <div className="glass-card p-4 flex items-center gap-3 border-amber-500/20">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              <span className="font-semibold">{counts.pending} event{counts.pending > 1 ? "s are" : " is"} waiting for admin approval.</span>
              {" "}You can publish once approved.
            </p>
          </div>
        )}
        {counts.approved > 0 && (
          <div className="glass-card p-4 flex items-center gap-3 border-green-500/20">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-300">
              <span className="font-semibold">{counts.approved} event{counts.approved > 1 ? "s are" : " is"} approved</span>
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
    </Layout>
  );
}
