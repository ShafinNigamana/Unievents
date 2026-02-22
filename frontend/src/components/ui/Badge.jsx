export default function Badge({ type = "status", value }) {
    // ── Status badges ─────────────────────────────────────────────
    const statusMap = {
        draft: "bg-slate-700/60 text-slate-300 border-slate-600/50",
        published: "bg-green-500/15 text-green-400 border-green-500/30",
        archived: "bg-blue-500/15  text-blue-400  border-blue-500/30",
    };

    // ── Approval badges ────────────────────────────────────────────
    const approvalMap = {
        pending: "bg-amber-500/15  text-amber-400  border-amber-500/30",
        approved: "bg-green-500/15  text-green-400  border-green-500/30",
        rejected: "bg-red-500/15    text-red-400    border-red-500/30",
    };

    const map = type === "approval" ? approvalMap : statusMap;
    const cls = map[value] ?? "bg-slate-700/60 text-slate-400 border-slate-600/50";
    const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
        >
            {label}
        </span>
    );
}
