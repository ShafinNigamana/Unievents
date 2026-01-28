import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";
import { getInitialTheme, applyTheme } from "../../context/theme";

import logoLight from "../../assets/logo-light.svg";
import logoDark from "../../assets/logo-dark.svg";

export default function Navbar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(getInitialTheme());

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const linkBase =
    "flex items-center gap-2 text-sm font-medium transition-colors";

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-700 shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Logo */}
  <span className="text-lg font-bold tracking-tight text-white">
  Unievents
</span>




        {/* Navigation */}
        <div className="flex items-center gap-8">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "text-indigo-700 dark:text-indigo-400"
                  : "text-slate-700 dark:text-slate-300 hover:text-indigo-700"
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) =>
              `${linkBase} ${
                isActive
                  ? "text-indigo-700 dark:text-indigo-400"
                  : "text-slate-700 dark:text-slate-300 hover:text-indigo-700"
              }`
            }
          >
            <Calendar className="w-4 h-4" />
            Events
          </NavLink>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-slate-700 dark:text-slate-300 hover:text-indigo-700"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Logout (UI only) */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
