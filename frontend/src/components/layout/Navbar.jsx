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
        `flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200 ${isActive
          ? "bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 shadow-sm dark:shadow-none"
          : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
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
    <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
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
  const dropRef = useRef(null);

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
    <nav className="sticky top-0 z-40 border-b border-white/8 backdrop-blur-xl bg-surface-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Brand */}
          <Link to={dashPath} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text tracking-tight">UniEvents</span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1 flex-1 pl-2">
              <NavLinks role={user.role} />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Public Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-5 mr-3 border-r border-slate-200 dark:border-white/10 pr-5 text-sm font-medium text-slate-500 dark:text-slate-400">
              <Link to="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</Link>
              <Link to="/faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">FAQ</Link>
              <Link to="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-all duration-200"
            >
              {theme === "dark"
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            {/* User dropdown */}
            {user && (
              <div className="hidden md:block relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-all duration-200 focus:outline-none ${
                    dropOpen 
                      ? "bg-slate-100 border-slate-300 shadow-inner dark:bg-white/10 dark:border-white/20"
                      : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 shadow-sm dark:shadow-none"
                  }`}
                >
                  <Avatar name={user.name} />
                  <div className="hidden lg:flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 max-w-[120px] truncate leading-none">
                      {user.name}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 z-50 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-fade-in bg-white dark:bg-[#14142b]"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/8">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[user.role] ?? ""}`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dropdown actions */}
                    <div className="p-1.5 space-y-0.5">
                      {/* Profile link — students only */}
                      {user.role === "student" && (
                        <button
                          onClick={() => { navigate("/profile"); setDropOpen(false); }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/8 rounded-xl transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <UserCircle className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                            <span>My Profile</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-brand-500" />
                        </button>
                      )}

                      {/* Sign out */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
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
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            {/* Not logged in */}
            {!user && (
              <div className="flex items-center gap-2">
                <Link to="/login" className="button-ghost py-2 px-4 text-sm">Sign in</Link>
                <Link to="/register" className="button-primary py-2 px-4 text-sm">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-white/8 bg-surface-900/98 backdrop-blur-xl">
          <div className="px-4 pt-3 pb-2 space-y-1">
            <NavLinks role={user.role} onClose={closeMobile} />
          </div>
          <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between text-sm">
            <Link to="/about" onClick={closeMobile} className="text-slate-400 hover:text-white transition-colors">About</Link>
            <Link to="/faq" onClick={closeMobile} className="text-slate-400 hover:text-white transition-colors">FAQ</Link>
            <Link to="/contact" onClick={closeMobile} className="text-slate-400 hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="px-4 py-3 border-t border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={user.name} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[user.role] ?? ""}`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}