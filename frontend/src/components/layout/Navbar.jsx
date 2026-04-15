import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Plus, LogOut,
  Archive, ChevronDown, ChevronRight, Menu, X, Sun, Moon,
  Bookmark, ClipboardList, UserCircle
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

function NavItem({ to, icon: Icon, label, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 relative group ${isActive
          ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 shadow-sm dark:shadow-none"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
        }`
      }
    >
      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110`} />
      <span>{label}</span>
    </NavLink>
  );
}

function NavLinks({ role, onClose }) {
  const p = { onClick: onClose };
  if (role === "student") return (
    <>
      <NavItem to="/dashboard/student" icon={LayoutDashboard} label="Dashboard" {...p} />
      <NavItem to="/events" icon={Calendar} label="Events" {...p} />
      <NavItem to="/events/archive" icon={Archive} label="Archive" {...p} />
      <NavItem to="/saved-events" icon={Bookmark} label="Saved" {...p} />
      <NavItem to="/my-registrations" icon={ClipboardList} label="Registrations" {...p} />
    </>
  );
  if (role === "organizer") return (
    <>
      <NavItem to="/dashboard/organizer" icon={LayoutDashboard} label="Dashboard" {...p} />
      <NavItem to="/events/new" icon={Plus} label="Create Event" {...p} />
      <NavItem to="/events" icon={Calendar} label="Browse" {...p} />
    </>
  );
  if (role === "admin") return (
    <>
      <NavItem to="/dashboard/admin" icon={LayoutDashboard} label="Dashboard" {...p} />
      <NavItem to="/events" icon={Calendar} label="All Events" {...p} />
      <NavItem to="/events/archive" icon={Archive} label="Archive" {...p} />
    </>
  );
  return null;
}

function Avatar({ name }) {
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  return (
    <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-glow-sm">
      {initials}
    </div>
  );
}

const ROLE_COLOR = {
  student: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  organizer: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  admin: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashPath =
    user?.role === "student" ? "/dashboard/student"
      : user?.role === "organizer" ? "/dashboard/organizer"
        : user?.role === "admin" ? "/dashboard/admin"
          : "/";

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-500 border-b ${
          scrolled 
            ? "py-2 bg-white/80 dark:bg-surface-900/90 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl" 
            : "py-4 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-12 flex items-center justify-between gap-4">

            {/* Brand */}
            <Link to={dashPath} className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow-sm group-hover:scale-110 transition-transform duration-500">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text tracking-tight items-center hidden sm:flex">
                UniEvents
              </span>
            </Link>

            {/* Desktop nav links */}
            {user && (
              <div className="hidden md:flex items-center gap-1 flex-1 pl-6">
                <NavLinks role={user.role} />
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">

              {/* Public Links (Desktop) */}
              <div className="hidden lg:flex items-center gap-6 mr-4 border-r border-slate-200 dark:border-white/10 pr-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                <Link to="/about" className="hover:text-brand-500 transition-colors">About</Link>
                <Link to="/faq" className="hover:text-brand-500 transition-colors">FAQ</Link>
                <Link to="/contact" className="hover:text-brand-500 transition-colors">Contact</Link>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300"
              >
                {theme === "dark"
                  ? <Sun className="w-5 h-5" />
                  : <Moon className="w-5 h-5" />}
              </button>

              {/* User dropdown */}
              {user && (
                <div className="hidden md:block relative" ref={dropRef}>
                  <button
                    onClick={() => setDropOpen(!dropOpen)}
                    className={`flex items-center gap-3 p-1 pr-3 rounded-full border transition-all duration-300 focus:outline-none ${
                      dropOpen 
                        ? "bg-slate-100 dark:bg-white/10 border-slate-300 dark:border-white/20 shadow-sm dark:shadow-glow-sm"
                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-sm dark:shadow-none"
                    }`}
                  >
                    <Avatar name={user.name} />
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${dropOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {dropOpen && (
                    <div
                      className="absolute right-0 mt-3 w-64 z-50 rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-slide-up bg-white dark:bg-[#0d0d1a]/95 backdrop-blur-2xl"
                    >
                      {/* User info */}
                      <div className="px-5 py-4 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/8">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown actions */}
                      <div className="p-2 space-y-1">
                        {user.role === "student" && (
                          <button
                            onClick={() => { navigate("/profile"); setDropOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 rounded-xl transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <UserCircle className="w-4 h-4 text-brand-400" />
                              <span>My Profile</span>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-400" />
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile hamburger */}
              {user && (
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              )}

              {/* Not logged in */}
              {!user && (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2">Sign in</Link>
                  <Link to="/register" className="button-primary py-2 px-5 text-sm">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-500 md:hidden ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMobile}
      />

      {/* Mobile Drawer Content */}
      <div 
        className={`fixed inset-y-0 right-0 z-[70] w-72 bg-white dark:bg-[#0d0d1a] border-l border-slate-200 dark:border-white/10 shadow-2xl transition-transform duration-500 ease-in-out md:hidden flex flex-col ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
          <span className="text-lg font-bold gradient-text">Menu</span>
          <button onClick={closeMobile} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {user && <NavLinks role={user.role} onClose={closeMobile} />}
          
          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-white/10 space-y-2">
            <Link to="/about" onClick={closeMobile} className="block px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">About</Link>
            <Link to="/faq" onClick={closeMobile} className="block px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</Link>
            <Link to="/contact" onClick={closeMobile} className="block px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
          </div>
        </div>

        {user && (
          <div className="p-6 border-t border-slate-100 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </>
  );
}