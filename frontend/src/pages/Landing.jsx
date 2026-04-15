import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Calendar, Sparkles, Users, ArrowRight, Star, CheckCircle,
  Bell, Heart, Rocket, Shield, Zap, ChevronDown, Globe,
  GraduationCap, Megaphone, ClipboardList, Building2,
  Archive, HelpCircle, MapPin,
} from "lucide-react";
import api from "../services/api";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

/* ══════════════════════════════════════════════════════
   HOOKS
   ══════════════════════════════════════════════════════ */

/* ── Count-up animation ── */
function useCountUp(target, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) { setStarted(true); return; }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [startOnView]);

  useEffect(() => {
    if (!started || target === 0 || target == null) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

/* ── Typing effect ── */
function useTypingEffect(words, typingSpeed = 100, pauseTime = 2000) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(current.substring(0, text.length + 1));
        if (text.length + 1 === current.length) {
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        setText(current.substring(0, text.length - 1));
        if (text.length === 0) {
          setIsDeleting(false);
          setWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? typingSpeed / 2 : typingSpeed);
    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words, typingSpeed, pauseTime]);

  return text;
}

/* ── Scroll-reveal observer ── */
function useScrollReveal(deps = []) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const revealTargets = () =>
      el.querySelectorAll(
        ".reveal:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed), .reveal-scale:not(.revealed)"
      );

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
    );

    const observe = () => {
      const targets = revealTargets();
      targets.forEach((t) => obs.observe(t));
    };

    // Initial scan (slight delay so DOM is painted)
    const timer = setTimeout(observe, 50);

    // Re-scan when children change (data loads → new cards render)
    const mutation = new MutationObserver(() => {
      observe();
    });
    mutation.observe(el, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      obs.disconnect();
      mutation.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return sectionRef;
}

/* ── Shooting Stars + Rising Sparkles Canvas ── */
function StarfieldCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let w, h;

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── Shooting Stars ── */
    const shootingStars = [];
    const spawnStar = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      shootingStars.push({
        x: Math.random() * cw * 0.8,
        y: Math.random() * ch * 0.3,
        len: 60 + Math.random() * 80,
        speed: 4 + Math.random() * 4,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.3,
        opacity: 1,
        width: 1 + Math.random() * 1.5,
        hue: 260 + Math.random() * 30, // purple range
        life: 0,
        maxLife: 40 + Math.random() * 30,
      });
    };

    /* ── Rising Sparkles ── */
    const sparkles = [];
    const spawnSparkle = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      sparkles.push({
        x: Math.random() * cw,
        y: ch + 5,
        radius: 1 + Math.random() * 2,
        speedY: 0.3 + Math.random() * 0.6,
        drift: (Math.random() - 0.5) * 0.3,
        opacity: 0,
        fadeIn: true,
        hue: 250 + Math.random() * 40,
        wobbleAmp: 10 + Math.random() * 20,
        wobbleSpeed: 0.01 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        life: 0,
      });
    };

    // Pre-populate
    for (let i = 0; i < 20; i++) {
      const s = { ...(() => { spawnSparkle(); return sparkles.pop(); })() };
      s.y = Math.random() * canvas.offsetHeight;
      s.opacity = 0.2 + Math.random() * 0.5;
      s.fadeIn = false;
      sparkles.push(s);
    }

    let frame = 0;
    const loop = () => {
      const cw = canvas.offsetWidth;
      const ch = canvas.offsetHeight;
      ctx.clearRect(0, 0, cw, ch);
      frame++;

      // Spawn shooting stars periodically
      if (frame % 90 === 0 || (frame % 45 === 0 && Math.random() > 0.6)) {
        spawnStar();
      }

      // Spawn sparkles
      if (frame % 12 === 0) spawnSparkle();

      /* Draw shooting stars */
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Fade out in last 30% of life
        const fadeStart = s.maxLife * 0.7;
        s.opacity = s.life > fadeStart ? 1 - (s.life - fadeStart) / (s.maxLife - fadeStart) : 1;

        const tailX = s.x - Math.cos(s.angle) * s.len;
        const tailY = s.y - Math.sin(s.angle) * s.len;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `hsla(${s.hue}, 80%, 70%, 0)`);
        grad.addColorStop(0.6, `hsla(${s.hue}, 80%, 75%, ${s.opacity * 0.5})`);
        grad.addColorStop(1, `hsla(${s.hue}, 90%, 85%, ${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.width * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 90%, ${s.opacity * 0.8})`;
        ctx.fill();

        if (s.life >= s.maxLife || s.x > cw + 100 || s.y > ch + 100) {
          shootingStars.splice(i, 1);
        }
      }

      /* Draw sparkles */
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const p = sparkles[i];
        p.life++;
        p.y -= p.speedY;
        p.phase += p.wobbleSpeed;
        const wobbleX = Math.sin(p.phase) * p.wobbleAmp;

        // Fade in then sustain
        if (p.fadeIn && p.opacity < 0.7) {
          p.opacity = Math.min(0.7, p.opacity + 0.015);
        } else {
          p.fadeIn = false;
        }

        // Fade out near top
        if (p.y < ch * 0.1) {
          p.opacity -= 0.01;
        }

        const drawX = p.x + wobbleX;

        // Glow
        ctx.beginPath();
        ctx.arc(drawX, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.opacity * 0.15})`;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(drawX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 85%, 82%, ${p.opacity})`;
        ctx.fill();

        // Twinkle
        if (Math.sin(p.life * 0.1) > 0.7) {
          ctx.beginPath();
          ctx.arc(drawX, p.y, p.radius * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 100%, 95%, ${p.opacity})`;
          ctx.fill();
        }

        if (p.opacity <= 0 || p.y < -10) {
          sparkles.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTS
   ══════════════════════════════════════════════════════ */


/* ── Animated stat card ── */
function AnimatedStat({ icon: Icon, color, label, target, suffix = "" }) {
  const { count, ref } = useCountUp(target || 0, 2200);
  return (
    <div ref={ref} className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-5 sm:p-6 flex flex-col items-center text-center gap-2 hover:border-brand-500/25 transition-all duration-300 group">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold gradient-text tabular-nums">
        {target != null ? count.toLocaleString() + suffix : "—"}
      </p>
      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

/* ── Event card ── */
function EventCard({ event }) {
  const date = new Date(event.eventDate).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });

  return (
    <Link to={`/events/${event._id}`} className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card overflow-hidden group hover:border-brand-500/25 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      {event.posterUrl ? (
        <div className="h-40 overflow-hidden">
          <img
            src={event.posterUrl}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-brand-100 dark:from-brand-700/30 to-purple-100 dark:to-purple-700/20 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-brand-300 dark:text-brand-500/40" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20">
            {event.category}
          </span>
          {event.averageRating > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-current" /> {event.averageRating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="text-slate-900 dark:text-white text-sm font-semibold mb-1 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">{event.title}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
          {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}</span>}
        </div>
        {event.interestedCount > 0 && (
          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-2 flex items-center gap-1">
            <Heart className="w-3 h-3 text-pink-500/60" /> {event.interestedCount} interested
          </p>
        )}
      </div>
    </Link>
  );
}

/* ── FAQ Accordion Item ── */
function FAQPreviewItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`border rounded-xl transition-all duration-300 ${
      isOpen ? "bg-slate-50 dark:bg-white/5 border-brand-200 dark:border-brand-500/20" : "border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15"
    }`}>
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer">
        <span className="text-sm font-medium text-slate-900 dark:text-white leading-snug">{faq.question}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-500 dark:text-brand-400" : ""}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 pb-4 pt-0">
          <div className="border-t border-slate-100 dark:border-white/8 pt-3">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Benefit card ── */
function BenefitCard({ icon: Icon, color, title, description }) {
  return (
    <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-7 flex flex-col gap-4 hover:border-brand-500/30 transition-all duration-300 group h-full">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-slate-900 dark:text-white font-semibold text-base mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ── Step ── */
function Step({ number, title, description }) {
  return (
    <div className="flex gap-5">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white text-sm font-bold shadow-glow-sm">
        {number}
      </div>
      <div>
        <h3 className="text-slate-900 dark:text-white font-semibold mb-1">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ══════════════════════════════════════════════════════ */

export default function Landing() {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [openFaqId, setOpenFaqId] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const typedText = useTypingEffect(
    ["starts here.", "comes alive.", "finds its spark.", "begins with you."],
    90, 2200
  );

  /* Scroll-reveal refs */
  const statsRef = useScrollReveal([dataLoaded]);
  const upcomingRef = useScrollReveal([dataLoaded]);
  const popularRef = useScrollReveal([dataLoaded]);
  const benefitsRef = useScrollReveal();
  const howRef = useScrollReveal();
  const faqRef = useScrollReveal([dataLoaded]);
  const ctaRef = useScrollReveal();

  /* Fetch data */
  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, eventsRes, faqsRes] = await Promise.allSettled([
          api.get("/public/stats"),
          api.get("/events?limit=6"),
          api.get("/public/faqs"),
        ]);

        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);

        if (eventsRes.status === "fulfilled") {
          const all = eventsRes.value.data.data || [];
          setEvents(all.slice(0, 3));
          const sorted = [...all].sort((a, b) => (b.interestedCount || 0) - (a.interestedCount || 0));
          setPopularEvents(sorted.slice(0, 3));
        }

        if (faqsRes.status === "fulfilled") {
          setFaqs((faqsRes.value.data.data || []).slice(0, 4));
        }
      } finally {
        setDataLoaded(true);
      }
    };
    load();
  }, []);

  const statItems = [
    { icon: Calendar, color: "bg-brand-500/80", label: "Total Events", target: stats?.totalEvents },
    { icon: Globe, color: "bg-green-600/80", label: "Published", target: stats?.publishedEvents },
    { icon: GraduationCap, color: "bg-blue-600/80", label: "Students", target: stats?.totalStudents },
    { icon: Megaphone, color: "bg-purple-600/80", label: "Organizers", target: stats?.totalOrganizers },
    { icon: ClipboardList, color: "bg-amber-600/80", label: "Registrations", target: stats?.totalRegistrations },
    { icon: Star, color: "bg-pink-600/80", label: "Reviews", target: stats?.totalReviews },
    { icon: Building2, color: "bg-teal-600/80", label: "Departments", target: stats?.departments },
    { icon: Archive, color: "bg-slate-500/80", label: "Archived", target: stats?.archivedEvents },
  ];

  return (
    <div className="min-h-screen bg-surface-900 text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative pt-32 pb-28 px-4 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-brand-700/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* ★ Shooting stars + rising sparkles ★ */}
        <StarfieldCanvas />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Your campus, alive with possibilities
          </div>

          {/* Headline with typing effect */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
            Every campus moment{" "}
            <br className="hidden sm:block" />
            <span className="gradient-text">{typedText}</span>
            <span className="animate-pulse text-brand-400">|</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up">
            UniEvents is where students discover experiences that matter,
            organizers build events that shine, and campus life truly comes alive.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link to="/register" className="button-primary px-8 py-3.5 text-base w-full sm:w-auto">
              Get started — it's free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/events" className="button-ghost px-8 py-3.5 text-base w-full sm:w-auto">
              Browse events
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-10 flex items-center justify-center gap-2 text-slate-500 text-sm">
            <div className="flex -space-x-2">
              {["#a58fff", "#6d3aff", "#a855f7", "#8660ff"].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-surface-900 flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: c }}>
                  {["S", "A", "R", "M"][i]}
                </div>
              ))}
            </div>
            <span>
              Join <strong className="text-slate-300">
                {stats?.totalStudents ? `${stats.totalStudents.toLocaleString()}+` : "1,200+"} students
              </strong> already on UniEvents
            </span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-slate-600 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </section>

      {/* ════════════════════════ LIVE STATS ════════════════════════ */}
      <section ref={statsRef} className="py-20 px-4 border-y border-slate-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Live Platform Data</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Numbers that grow with us</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {statItems.map((item, i) => (
              <div key={item.label} className="reveal-scale h-full" style={{ "--reveal-delay": `${i * 0.08}s` }}>
                <AnimatedStat {...item} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ UPCOMING EVENTS ════════════════════════ */}
      {events.length > 0 && (
        <section ref={upcomingRef} className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 reveal">
              <div>
                <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-2">Happening Soon</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Upcoming events</h2>
              </div>
              <Link to="/events" className="button-ghost py-2 px-5 text-sm">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e, i) => (
                <div key={e._id} className="reveal h-full" style={{ "--reveal-delay": `${0.1 + i * 0.12}s` }}>
                  <EventCard event={e} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════ POPULAR EVENTS ════════════════════════ */}
      {popularEvents.length > 0 && popularEvents.some(e => e.interestedCount > 0) && (
        <section ref={popularRef} className="py-24 px-4 border-t border-slate-100 dark:border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10 reveal">
              <div>
                <p className="text-pink-400 text-sm font-semibold uppercase tracking-widest mb-2">Most Loved</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Popular events</h2>
              </div>
              <Link to="/events" className="button-ghost py-2 px-5 text-sm">
                Explore more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularEvents.map((e, i) => (
                <div key={e._id} className="reveal h-full" style={{ "--reveal-delay": `${0.1 + i * 0.12}s` }}>
                  <EventCard event={e} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════ BENEFITS ════════════════════════ */}
      <section ref={benefitsRef} className="py-24 px-4 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal">
            <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Why students love it</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Built for the real campus experience</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto">Whether you're there to discover, participate, or create — UniEvents has your back.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bell, color: "bg-brand-500/80", title: "Never Miss a Moment", description: "All campus events in one place. No more hunting through notice boards or missed announcements." },
              { icon: Rocket, color: "bg-purple-600/80", title: "Bring Your Idea to Life", description: "Got a vision for an event? Submit it, get it approved, and watch your idea become something special." },
              { icon: Heart, color: "bg-pink-600/80", title: "Be Part of Something Bigger", description: "From tech fests to cultural nights — find events that match your passions and connect with people." },
              { icon: Star, color: "bg-amber-600/80", title: "Your Campus Story, Archived", description: "Past events are always there. Relive the best moments and see what made your campus year memorable." },
              { icon: Users, color: "bg-blue-600/80", title: "A Community, Not a Calendar", description: "UniEvents connects students, organisers, and coordinators in one shared space — built together." },
              { icon: Shield, color: "bg-green-600/80", title: "Only the Best Gets Through", description: "Every event goes through approval. You see only real, verified, well-organised campus events." },
            ].map((b, i) => (
              <div key={b.title} className="reveal h-full" style={{ "--reveal-delay": `${i * 0.1}s` }}>
                <BenefitCard {...b} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <section ref={howRef} className="py-24 px-4 border-t border-slate-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Up and running in minutes</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10">No setup. No complexity. Just sign up, look around, and start experiencing campus life on a whole new level.</p>
              <div className="space-y-8">
                {[
                  { n: "1", t: "Create your free account", d: "Sign up as a student to discover events, or as an organiser to start creating them. Takes less than a minute." },
                  { n: "2", t: "Explore what's happening", d: "Browse upcoming events across every category — from workshops and hackathons to cultural shows and sports days." },
                  { n: "3", t: "Show up and make memories", d: "Found something exciting? Mark your calendar, tell your friends, and be part of the experience." },
                ].map((s, i) => (
                  <div key={s.n} className="reveal" style={{ "--reveal-delay": `${0.2 + i * 0.15}s` }}>
                    <Step number={s.n} title={s.t} description={s.d} />
                  </div>
                ))}
              </div>
            </div>
            <div className="relative reveal-right" style={{ "--reveal-delay": "0.2s" }}>
              <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-card p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/8">
                  <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-white text-sm font-semibold">Tech Hackathon 2025</p>
                    <p className="text-slate-500 text-xs">Technical · March 15</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/25">Live</span>
                </div>
                {[
                  { label: "Venue", value: "Main Auditorium" },
                  { label: "Time", value: "9:00 AM – 6:00 PM" },
                  { label: "Category", value: "Technical" },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{r.label}</span>
                    <span className="text-slate-700 dark:text-slate-200 font-medium">{r.value}</span>
                  </div>
                ))}
                <div className="pt-2 flex flex-wrap gap-2">
                  {["React", "Node.js", "AI", "Design"].map((t) => (
                    <span key={t} className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400">{t}</span>
                  ))}
                </div>
                <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 dark:text-green-400" />
                  Approved & verified event
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FAQ PREVIEW ════════════════════════ */}
      {faqs.length > 0 && (
        <section ref={faqRef} className="py-24 px-4 border-t border-slate-100 dark:border-white/5">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 reveal">
              <p className="text-brand-400 text-sm font-semibold uppercase tracking-widest mb-3">Common Questions</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Got questions? We've got answers</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={faq._id} className="reveal" style={{ "--reveal-delay": `${0.1 + i * 0.1}s` }}>
                  <FAQPreviewItem
                    faq={faq}
                    isOpen={openFaqId === faq._id}
                    onToggle={() => setOpenFaqId(prev => prev === faq._id ? null : faq._id)}
                  />
                </div>
              ))}
            </div>
            <div className="text-center mt-8 reveal" style={{ "--reveal-delay": "0.5s" }}>
              <Link to="/faq" className="button-ghost py-2 px-6 text-sm">
                View all FAQs <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════ FINAL CTA ════════════════════════ */}
      <section ref={ctaRef} className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-lg dark:shadow-card p-12 relative overflow-hidden border-brand-500/20 reveal-scale">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(109,58,255,0.18) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Your campus is waiting</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-lg mx-auto">
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

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <Footer />
    </div>
  );
}
