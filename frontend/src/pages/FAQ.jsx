import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  HelpCircle,
  Calendar,
  MessageCircle,
  Search,
} from "lucide-react";
import api from "../services/api";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

/* ── Category icon + color map ── */
const CATEGORY_META = {
  General: { color: "bg-brand-500/20 text-brand-300 border-brand-500/25" },
  Registration: {
    color: "bg-blue-500/20 text-blue-300 border-blue-500/25",
  },
  Eligibility: {
    color: "bg-amber-500/20 text-amber-300 border-amber-500/25",
  },
  Account: {
    color: "bg-green-500/20 text-green-300 border-green-500/25",
  },
  Organizer: {
    color: "bg-purple-500/20 text-purple-300 border-purple-500/25",
  },
};

const fallbackColor = "bg-white/10 text-slate-300 border-white/15";

/* ── FAQ Item (Accordion) ── */
function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div
      className={`group border rounded-xl transition-all duration-300 ${
        isOpen
          ? "bg-slate-50 dark:bg-white/5 border-brand-200 dark:border-brand-500/20 shadow-sm dark:shadow-glow-sm"
          : "border-slate-200 dark:border-white/8 hover:border-slate-300 dark:hover:border-white/15 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-snug pr-2">
          {faq.question}
        </span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? "bg-brand-50 dark:bg-brand-500/20 text-brand-500 dark:text-brand-400 rotate-180"
              : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-white/10 group-hover:text-slate-600 dark:group-hover:text-slate-300"
          }`}
        >
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
          <div className="border-t border-slate-100 dark:border-white/8 pt-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Skeleton loader ── */
function FAQSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="border border-slate-200 dark:border-white/8 rounded-xl px-6 py-5 flex justify-between items-center"
        >
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded-lg w-3/4" />
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5" />
        </div>
      ))}
    </div>
  );
}

/* ── Category filter pill ── */
function CategoryPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
        active
          ? "bg-brand-gradient text-white shadow-glow-sm"
          : "border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-white/20"
      }`}
    >
      {label}
    </button>
  );
}

/* ── Main FAQ Page ── */
export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const { data } = await api.get("/public/faqs");
        setFaqs(data.data || []);
      } catch (err) {
        setError("Unable to load FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  /* Derive categories from data */
  const categories = [
    "All",
    ...new Set(faqs.map((f) => f.category).filter(Boolean)),
  ];

  /* Filter FAQs */
  const filtered = faqs.filter((faq) => {
    const matchesCategory =
      activeCategory === "All" || faq.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  /* Group by category */
  const grouped = filtered.reduce((acc, faq) => {
    const cat = faq.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  const toggleFAQ = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-surface-900 text-slate-900 dark:text-slate-100">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-16 px-4 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-700/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-56 h-56 bg-purple-700/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm font-medium mb-6">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQs
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
            Frequently Asked{" "}
            <span className="gradient-text">Questions</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto mb-8">
            Everything you need to know about UniEvents. Can't find an answer?{" "}
            <Link
              to="/contact"
              className="text-brand-400 hover:text-brand-300 transition-colors underline underline-offset-2"
            >
              Reach out to us
            </Link>
            .
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-11 pr-4 py-3 text-sm"
            />
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Category pills */}
          {!loading && faqs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && <FAQSkeleton />}

          {/* Error */}
          {error && (
            <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-8 text-center">
              <MessageCircle className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
              <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                Oops, something went wrong
              </p>
              <p className="text-sm text-slate-500">{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && faqs.length === 0 && (
            <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-12 text-center">
              <HelpCircle className="w-14 h-14 text-brand-500/30 mx-auto mb-4" />
              <p className="text-slate-700 dark:text-slate-300 font-medium text-lg mb-2">
                No FAQs available
              </p>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                We're working on adding frequently asked questions. Check back
                soon!
              </p>
            </div>
          )}

          {/* No results for filter */}
          {!loading &&
            !error &&
            faqs.length > 0 &&
            filtered.length === 0 && (
              <div className="bg-white dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl rounded-2xl shadow-sm dark:shadow-card p-10 text-center">
                <Search className="w-10 h-10 text-slate-500/40 mx-auto mb-3" />
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-1">
                  No matching FAQs
                </p>
                <p className="text-sm text-slate-500">
                  Try a different search term or category.
                </p>
              </div>
            )}

          {/* FAQs grouped by category */}
          {!loading &&
            !error &&
            Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="mb-10 last:mb-0">
                {/* Category header — only show if not filtering by specific category */}
                {activeCategory === "All" && (
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                        CATEGORY_META[category]?.color || fallbackColor
                      }`}
                    >
                      {category}
                    </span>
                    <span className="text-xs text-slate-600">
                      {items.length} question{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  {items.map((faq) => (
                    <FAQItem
                      key={faq._id}
                      faq={faq}
                      isOpen={openId === faq._id}
                      onToggle={() => toggleFAQ(faq._id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
