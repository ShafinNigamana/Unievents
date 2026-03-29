import { Link } from "react-router-dom";
import { Calendar, Star } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-4 bg-surface-900 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold gradient-text">UniEvents</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              The all-in-one platform for university event discovery, creation, and management.
            </p>
          </div>
          {/* Quick Links */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Quick Links</p>
            <div className="space-y-2">
              {[
                { to: "/events", label: "Browse Events" },
                { to: "/events/archive", label: "Event Archive" },
                { to: "/about", label: "About Us" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          {/* Support */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Support</p>
            <div className="space-y-2">
              {[
                { to: "/faq", label: "FAQ" },
                { to: "/contact", label: "Contact Us" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          {/* Account */}
          <div>
            <p className="text-white text-sm font-semibold mb-4">Account</p>
            <div className="space-y-2">
              <Link to="/login" className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">Sign In</Link>
              <Link to="/register" className="block text-sm text-slate-500 hover:text-slate-300 transition-colors">Create Account</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">© {new Date().getFullYear()} UniEvents · Built for campus communities</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-current" />
            ))}
            <span className="text-slate-500 text-xs ml-1">Loved by students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
