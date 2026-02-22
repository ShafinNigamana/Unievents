import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Calendar, Plus, LogOut,
  Archive, ChevronDown, Menu, X
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

function NavItem({ to, icon: Icon, label, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all duration-200 ${isActive
          ? "bg-brand-500/20 text-brand-300"
          : "text-slate-400 hover:text-white hover:bg-white/8"
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
      <NavItem to="/events" icon={Calendar} label="Events"    {...p} />
      <NavItem to="/events/archive" icon={Archive} label="Archive"   {...p} />
    </>
  );
  if (role === "organizer") return (
    <>
      <NavItem to="/dashboard/organizer" icon={LayoutDashboard} label="Dashboard"    {...p} />
      <NavItem to="/events/new" icon={Plus} label="Create Event" {...p} />
      <NavItem to="/events" icon={Calendar} label="Browse"       {...p} />
    </>
  );
  if (role === "admin") return (
    <>
      <NavItem to="/dashboard/admin" icon={LayoutDashboard} label="Dashboard" {...p} />
      <NavItem to="/events" icon={Calendar} label="All Events" {...p} />
      <NavItem to="/events/archive" icon={Archive} label="Archive"   {...p} />
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

            {/* User dropdown trigger */}
            {user && (
              <div className="hidden md:block relative" ref={dropRef}>
                <button
                  onClick={() => setDropOpen(!dropOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <Avatar name={user.name} />
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white max-w-[90px] truncate">
                      {user.name}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[user.role] ?? ""}`}>
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown panel */}
                {dropOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 z-50 rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-fade-in"
                    style={{ background: "#14142b" }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3 bg-white/5 border-b border-white/8">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ROLE_COLOR[user.role] ?? ""}`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Sign out */}
                    <div className="p-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
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
