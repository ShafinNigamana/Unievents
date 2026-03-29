export function getInitialTheme() {
  const savedTheme = localStorage.getItem("explicit-theme");
  if (savedTheme) return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme, save = false) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }

  if (save) {
    localStorage.setItem("explicit-theme", theme);
  }
}
