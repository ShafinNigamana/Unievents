import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck, CheckCircle2, XCircle, RotateCcw, Trash2,
  AlertCircle, Archive, Calendar, Eye, Loader2,
  Users, TrendingUp, Clock, FileX
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { SkeletonGrid } from "../../components/ui/Spinner";
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

/* ── Section header ─────────────────────────── */
function SectionHeader({ icon: Icon, title, count, iconColor }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <h2>{title}</h2>
      {count !== undefined && (
        <span className="ml-1 text-sm text-slate-500">({count})</span>
      )}
    </div>
  );
}

/* ── Format date ─────────────────────────────-- */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

/* ── Action button ──────────────────────────── */
function ActionBtn({ icon: Icon, label, onClick, variant = "ghost", loading: busy = false }) {
  const cls = {
    ghost: "text-slate-400 hover:text-white hover:bg-white/10",
    success: "text-green-400 hover:text-green-300 hover:bg-green-500/10",
    danger: "text-red-400   hover:text-red-300   hover:bg-red-500/10",
    warning: "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10",
    brand: "text-brand-400 hover:text-brand-300 hover:bg-brand-500/10",
  };
  return (
    <button
      onClick={onClick}
      disabled={busy}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  transition-all ${cls[variant]} disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
      {label}
    </button>
  );
}

/* ── Reusable events table ───────────────────── */
function EventsTable({ events, actions }) {
  return (
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
            <tr key={event._id} className="hover:bg-white/3 transition-colors group">
              <td className="px-6 py-4">
                <p className="font-medium text-white text-sm leading-snug group-hover:text-brand-300 transition-colors">
                  {event.title}
                </p>
                {event.category && (
                  <p className="text-xs text-slate-500 mt-0.5">{event.category}</p>
                )}
              </td>
              <td className="px-4 py-4 text-slate-400 whitespace-nowrap text-xs">
                {fmtDate(event.eventDate)}
              </td>
              <td className="px-4 py-4"><Badge type="status" value={event.status} /></td>
              <td className="px-4 py-4"><Badge type="approval" value={event.approvalStatus} /></td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1 justify-end flex-wrap">
                  {actions(event)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Empty state ─────────────────────────────── */
function EmptyRow({ icon: Icon, message }) {
  return (
    <div className="py-14 text-center space-y-2">
      <Icon className="w-10 h-10 text-slate-600 mx-auto" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════════ */
export default function AdminDashboard() {
  const navigate = useNavigate();

  /* ── State ── */
  const [pending, setPending] = useState([]);
  const [allEvents, setAll] = useState([]);
  const [deleted, setDeleted] = useState([]);

  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingDeleted, setLoadingDeleted] = useState(true);

  /* Action loading map: { [eventId]: action } */
  const [actionLoading, setActionLoading] = useState({});
  const setAL = (id, val) =>
    setActionLoading((p) => ({ ...p, [id]: val }));

  /* ── Modals ── */
  const [permDeleteTarget, setPermDeleteTarget] = useState(null);
  const [permDeleting, setPermDeleting] = useState(false);

  /* ── Fetch: all events via admin endpoint, split into pending + all ── */
  const fetchAll = useCallback(async () => {
    setLoadingPending(true);
    setLoadingAll(true);
    try {
      const res = await api.get("/events/all");
      const all = res.data?.data ?? [];
      setAll(all);
      setPending(all.filter(
        (e) => e.status === "draft" && e.approvalStatus === "pending"
      ));
    } catch { /* silent */ } finally {
      setLoadingPending(false);
      setLoadingAll(false);
    }
  }, []);

  /* ── Fetch: soft-deleted ── */
  const fetchDeleted = useCallback(async () => {
    setLoadingDeleted(true);
    try {
      const res = await api.get("/events/deleted");
      setDeleted(res.data?.data ?? []);
    } catch { /* silent */ } finally { setLoadingDeleted(false); }
  }, []);

  useEffect(() => {
    fetchAll();
    fetchDeleted();
  }, [fetchAll, fetchDeleted]);

  /* ── Approve / Reject ── */
  const handleApproval = async (event, approvalStatus) => {
    setAL(event._id, approvalStatus);
    try {
      await api.patch(`/events/${event._id}/approve`, { approvalStatus });
      fetchAll();
      fetchDeleted();
    } catch (err) {
      alert(err.response?.data?.error || "Action failed.");
    } finally {
      setAL(event._id, null);
    }
  };

  /* ── Restore ── */
  const handleRestore = async (event) => {
    setAL(event._id, "restore");
    try {
      await api.patch(`/events/${event._id}/restore`);
      fetchDeleted();
    } catch (err) {
      alert(err.response?.data?.error || "Restore failed.");
    } finally {
      setAL(event._id, null);
    }
  };

  /* ── Permanent delete ── */
  const handlePermanentDelete = async () => {
    if (!permDeleteTarget) return;
    setPermDeleting(true);
    try {
      await api.delete(`/events/${permDeleteTarget._id}/permanent`);
      setPermDeleteTarget(null);
      fetchDeleted();
    } catch (err) {
      alert(err.response?.data?.error || "Permanent delete failed.");
    } finally {
      setPermDeleting(false);
    }
  };

  /* ── Stats ── */
  const stats = {
    pending: pending.length,
    published: allEvents.filter((e) => e.status === "published").length,
    archived: allEvents.filter((e) => e.status === "archived").length,
    deleted: deleted.length,
  };

  return (
    <Layout>
      <div className="space-y-10 animate-fade-in">

        {/* ── Header ── */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h1>Admin Dashboard</h1>
          </div>
          <p>Approve events, manage the archive, and control deletions.</p>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Clock} label="Pending Approval" value={stats.pending} color="bg-amber-600/80" border="border-amber-500/20" />
          <StatCard icon={TrendingUp} label="Published" value={stats.published} color="bg-brand-600/80" border="border-brand-500/20" />
          <StatCard icon={Archive} label="Archived" value={stats.archived} color="bg-blue-600/80" border="border-blue-500/20" />
          <StatCard icon={FileX} label="Soft Deleted" value={stats.deleted} color="bg-red-700/80" border="border-red-500/20" />
        </div>

        {/* ═══════════════════════════════════════
            SECTION 1 — PENDING APPROVALS
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon={AlertCircle} iconColor="text-amber-400"
            title="Pending Approvals" count={pending.length}
          />

          <div className="glass-card overflow-hidden">
            {loadingPending ? (
              <div className="p-6"><SkeletonGrid count={2} /></div>
            ) : pending.length === 0 ? (
              <EmptyRow icon={CheckCircle2} message="No events awaiting approval." />
            ) : (
              <EventsTable
                events={pending}
                actions={(event) => (
                  <>
                    <ActionBtn
                      icon={Eye} label="View"
                      onClick={() => navigate(`/events/${event._id}`)}
                    />
                    <ActionBtn
                      icon={CheckCircle2} label="Approve" variant="success"
                      loading={actionLoading[event._id] === "approved"}
                      onClick={() => handleApproval(event, "approved")}
                    />
                    <ActionBtn
                      icon={XCircle} label="Reject" variant="danger"
                      loading={actionLoading[event._id] === "rejected"}
                      onClick={() => handleApproval(event, "rejected")}
                    />
                  </>
                )}
              />
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 2 — ALL EVENTS (published + archived)
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon={Calendar} iconColor="text-brand-400"
            title="All Published & Archived Events" count={allEvents.length}
          />

          <div className="glass-card overflow-hidden">
            {loadingAll ? (
              <div className="p-6"><SkeletonGrid count={3} /></div>
            ) : allEvents.length === 0 ? (
              <EmptyRow icon={Calendar} message="No published or archived events yet." />
            ) : (
              <EventsTable
                events={allEvents}
                actions={(event) => (
                  <ActionBtn
                    icon={Eye} label="View"
                    onClick={() => navigate(`/events/${event._id}`)}
                  />
                )}
              />
            )}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 3 — SOFT DELETED
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader
            icon={Trash2} iconColor="text-red-400"
            title="Soft Deleted Events" count={deleted.length}
          />

          <div className="glass-card overflow-hidden">
            {loadingDeleted ? (
              <div className="p-6"><SkeletonGrid count={2} /></div>
            ) : deleted.length === 0 ? (
              <EmptyRow icon={FileX} message="No soft-deleted events." />
            ) : (
              <EventsTable
                events={deleted}
                actions={(event) => (
                  <>
                    <ActionBtn
                      icon={RotateCcw} label="Restore" variant="brand"
                      loading={actionLoading[event._id] === "restore"}
                      onClick={() => handleRestore(event)}
                    />
                    <ActionBtn
                      icon={Trash2} label="Delete Forever" variant="danger"
                      onClick={() => setPermDeleteTarget(event)}
                    />
                  </>
                )}
              />
            )}
          </div>

          {deleted.length > 0 && (
            <p className="text-xs text-slate-500 mt-2 px-1">
              Restored events return to their previous status. Permanent deletion cannot be undone.
            </p>
          )}
        </section>

      </div>

      {/* ── Permanent Delete Confirm Modal ── */}
      <Modal
        isOpen={!!permDeleteTarget}
        onClose={() => setPermDeleteTarget(null)}
        title="Permanently Delete Event"
        danger
      >
        <p className="text-sm text-slate-300 mb-1">
          This will <span className="font-semibold text-red-400">permanently erase</span>{" "}
          <span className="text-white">"{permDeleteTarget?.title}"</span> from the database.
        </p>
        <p className="text-xs text-slate-500 mb-6">
          This action is irreversible. There is no way to recover the event after this.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setPermDeleteTarget(null)}
            className="button-ghost py-2 px-4 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handlePermanentDelete}
            disabled={permDeleting}
            className="button-danger py-2 px-4 text-sm"
          >
            {permDeleting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
              : <><Trash2 className="w-4 h-4" /> Permanently Delete</>
            }
          </button>
        </div>
      </Modal>
    </Layout>
  );
}
