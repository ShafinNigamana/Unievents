export default function Badge({ type = "status", value }) {
    // ── Status badges ─────────────────────────────────────────────
    const statusMap = {
        draft: "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600/50",
        published: "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30",
        archived: "bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/30",
    };

    // ── Approval badges ────────────────────────────────────────────
    const approvalMap = {
        pending: "bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30",
        approved: "bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/30",
        rejected: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30",
    };

    const map = type === "approval" ? approvalMap : statusMap;
    const cls = map[value] ?? "bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600/50";
    const label = value ? value.charAt(0).toUpperCase() + value.slice(1) : "—";

    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide ${cls}`}
        >
            {label}
        </span>
    );
}
