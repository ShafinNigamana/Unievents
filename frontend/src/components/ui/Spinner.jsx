import { Loader2 } from "lucide-react";

/* ── Spinner ─────────────────────────────────── */
export function Spinner({ size = "md", className = "" }) {
    const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
    return (
        <Loader2
            className={`animate-spin text-brand-400 ${sizes[size] ?? sizes.md} ${className}`}
        />
    );
}

/* ── Full-page loading ───────────────────────── */
export function PageLoader() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-surface-900">
            <Spinner size="lg" />
            <p className="text-slate-400 text-sm">Loading…</p>
        </div>
    );
}

/* ── Skeleton card ───────────────────────────── */
export function SkeletonCard() {
    return (
        <div className="glass-card p-5 space-y-3 animate-pulse">
            <div className="h-4 bg-white/10 rounded-lg w-3/4" />
            <div className="h-3 bg-white/8 rounded-lg w-1/2" />
            <div className="h-3 bg-white/8 rounded-lg w-2/3" />
            <div className="flex gap-2 mt-2">
                <div className="h-5 w-16 bg-white/10 rounded-full" />
                <div className="h-5 w-20 bg-white/10 rounded-full" />
            </div>
        </div>
    );
}

/* ── Skeleton grid ───────────────────────────── */
export function SkeletonGrid({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
