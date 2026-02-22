import { Link } from "react-router-dom";
import {
    Calendar, Sparkles, Users, Zap, ArrowRight,
    Star, CheckCircle, Bell, Heart, Rocket, Shield
} from "lucide-react";

/* ── Top navbar ───────────────────────────────────────── */
function LandingNav() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-surface-900/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text tracking-tight">UniEvents</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="button-ghost py-2 px-5 text-sm">Sign in</Link>
                        <Link to="/register" className="button-primary py-2 px-5 text-sm">Join Free</Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}

/* ── Stat item ────────────────────────────────────────── */
function Stat({ value, label }) {
    return (
        <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{value}</p>
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    );
}

/* ── Benefit card ─────────────────────────────────────── */
function BenefitCard({ icon: Icon, color, title, description }) {
    return (
        <div className="glass-card p-7 flex flex-col gap-4 hover:border-brand-500/30 transition-all duration-300 group">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

/* ── Step ─────────────────────────────────────────────── */
function Step({ number, title, description }) {
    return (
        <div className="flex gap-5">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold shadow-glow-sm">
                {number}
            </div>
            <div>
                <h3 className="text-white font-semibold mb-1">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

/* ── Main Landing Page ────────────────────────────────── */
export default function Landing() {
    return (
        <div className="min-h-screen bg-surface-900 text-slate-100">
            <LandingNav />

            {/* ── HERO ── */}
            <section className="relative pt-32 pb-24 px-4 overflow-hidden">
                {/* Background glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-700/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-40 right-1/4 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8">
                        <Sparkles className="w-3.5 h-3.5" />
                        Your campus, alive with possibilities
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                        Every campus moment{" "}
                        <span className="gradient-text">starts here.</span>
                    </h1>

                    {/* Sub-copy */}
                    <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                        UniEvents is where students discover experiences that matter,
                        organizers build events that shine, and campus life truly comes alive.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="button-primary px-8 py-3.5 text-base w-full sm:w-auto">
                            Get started — it's free
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/events" className="button-ghost px-8 py-3.5 text-base w-full sm:w-auto">
                            Browse events
                        </Link>
                    </div>

                    {/* Social proof micro-text */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-500 text-sm">
                        <div className="flex -space-x-2">
                            {["#a58fff", "#6d3aff", "#a855f7", "#8660ff"].map((c, i) => (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-surface-900 flex items-center justify-center text-xs text-white font-bold"
                                    style={{ background: c }}>
                                    {["S", "A", "R", "M"][i]}
                                </div>
                            ))}
                        </div>
                        <span>Join <strong className="text-slate-300">1,200+ students</strong> already on UniEvents</span>
                    </div>
                </div>

                {/* Hero card preview */}
                <div className="relative max-w-5xl mx-auto mt-20 px-4">
                    <div className="glass-card p-6 border-brand-500/20 shadow-glow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-3 h-3 rounded-full bg-red-500/70" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                            <div className="w-3 h-3 rounded-full bg-green-500/70" />
                            <div className="flex-1 ml-2 h-5 rounded bg-white/5 max-w-xs" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { title: "Tech Hackathon 2025", cat: "Technical", color: "bg-brand-500/20 text-brand-300" },
                                { title: "Cultural Fest Auditions", cat: "Cultural", color: "bg-purple-500/20 text-purple-300" },
                                { title: "Leadership Summit", cat: "Academic", color: "bg-blue-500/20 text-blue-300" },
                            ].map((e) => (
                                <div key={e.title} className="rounded-xl border border-white/10 bg-white/3 p-4">
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${e.color} mb-3 inline-block`}>
                                        {e.cat}
                                    </span>
                                    <p className="text-white text-sm font-semibold">{e.title}</p>
                                    <div className="mt-2 h-2 bg-white/10 rounded-full w-3/4" />
                                    <div className="mt-1.5 h-2 bg-white/5 rounded-full w-1/2" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Glow under card */}
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-brand-600/20 blur-3xl rounded-full pointer-events-none" />
                </div>
            </section>

            {/* ── STATS ── */}
            <section className="py-16 border-y border-white/5">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <Stat value="500+" label="Events hosted" />
                        <Stat value="1,200+" label="Active students" />
                        <Stat value="80+" label="Organizers" />
                        <Stat value="20+" label="Categories" />
                    </div>
                </div>
            </section>

            {/* ── BENEFITS ── */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-14">
                        <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Why students love it</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-white">
                            Built for the real campus experience
                        </h2>
                        <p className="text-slate-400 mt-3 max-w-xl mx-auto">
                            Whether you're there to discover, participate, or create — UniEvents has your back.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <BenefitCard
                            icon={Bell}
                            color="bg-brand-500/80"
                            title="Never Miss a Moment"
                            description="All campus events in one place. No more hunting through notice boards or missed announcements — everything you care about is right here."
                        />
                        <BenefitCard
                            icon={Rocket}
                            color="bg-purple-600/80"
                            title="Bring Your Idea to Life"
                            description="Got a vision for an event? Submit it, get it approved, and watch your idea become something your entire campus talks about."
                        />
                        <BenefitCard
                            icon={Heart}
                            color="bg-pink-600/80"
                            title="Be Part of Something Bigger"
                            description="From tech fests to cultural nights — find events that match your passions and connect with people who share them."
                        />
                        <BenefitCard
                            icon={Star}
                            color="bg-amber-600/80"
                            title="Your Campus Story, Archived"
                            description="Missed something? Past events are always there. Relive the best moments and see what made your campus year memorable."
                        />
                        <BenefitCard
                            icon={Users}
                            color="bg-blue-600/80"
                            title="A Community, Not Just a Calendar"
                            description="UniEvents connects students, organisers, and coordinators in one shared space — because great events are built together."
                        />
                        <BenefitCard
                            icon={Shield}
                            color="bg-green-600/80"
                            title="Only the Best Gets Through"
                            description="Every event goes through a quality check. That means you see only real, verified, well-organised campus events — no noise."
                        />
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-24 px-4 border-t border-white/5">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left — text */}
                        <div>
                            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Up and running in minutes
                            </h2>
                            <p className="text-slate-400 mb-10">
                                No setup. No complexity. Just sign up, look around, and start experiencing campus life on a whole new level.
                            </p>

                            <div className="space-y-8">
                                <Step
                                    number="1"
                                    title="Create your free account"
                                    description="Sign up as a student to discover events, or as an organiser to start creating them. Takes less than a minute."
                                />
                                <Step
                                    number="2"
                                    title="Explore what's happening"
                                    description="Browse upcoming events across every category — from workshops and hackathons to cultural shows and sports days."
                                />
                                <Step
                                    number="3"
                                    title="Show up and make memories"
                                    description="Found something exciting? Mark your calendar, tell your friends, and be part of the experience."
                                />
                            </div>
                        </div>

                        {/* Right — visual card */}
                        <div className="relative">
                            <div className="glass-card p-6 space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b border-white/8">
                                    <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-semibold">Tech Hackathon 2025</p>
                                        <p className="text-slate-500 text-xs">Technical · March 15</p>
                                    </div>
                                    <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/25">Live</span>
                                </div>
                                {[
                                    { label: "Venue", value: "Main Auditorium" },
                                    { label: "Time", value: "9:00 AM – 6:00 PM" },
                                    { label: "Category", value: "Technical" },
                                ].map((r) => (
                                    <div key={r.label} className="flex justify-between text-sm">
                                        <span className="text-slate-500">{r.label}</span>
                                        <span className="text-slate-200 font-medium">{r.value}</span>
                                    </div>
                                ))}
                                <div className="pt-2 flex flex-wrap gap-2">
                                    {["React", "Node.js", "AI", "Design"].map((t) => (
                                        <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-slate-400">{t}</span>
                                    ))}
                                </div>
                                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                    Approved & verified event
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section className="py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="glass-card p-12 relative overflow-hidden border-brand-500/20">
                        <div className="absolute inset-0 pointer-events-none"
                            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(109,58,255,0.18) 0%, transparent 70%)" }} />
                        <div className="relative z-10">
                            <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-4" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Your campus is waiting
                            </h2>
                            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                                Don't sit on the sidelines. Join UniEvents and start experiencing every corner of campus life.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/register" className="button-primary px-8 py-3.5 text-base w-full sm:w-auto">
                                    Join for free today
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link to="/login" className="button-ghost px-8 py-3.5 text-base w-full sm:w-auto">
                                    Already have an account?
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-white/5 py-10 px-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-gradient flex items-center justify-center">
                            <Calendar className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-bold gradient-text">UniEvents</span>
                    </div>
                    <p className="text-slate-500 text-sm text-center">
                        © {new Date().getFullYear()} UniEvents · Built for campus communities
                    </p>
                    <div className="flex items-center gap-5 text-sm text-slate-500">
                        <Link to="/login" className="hover:text-slate-300 transition-colors">Sign in</Link>
                        <Link to="/register" className="hover:text-slate-300 transition-colors">Register</Link>
                        <Link to="/events" className="hover:text-slate-300 transition-colors">Events</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
