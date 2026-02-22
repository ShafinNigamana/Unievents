export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0eeff",
          100: "#e0dcff",
          200: "#c5baff",
          300: "#a58fff",
          400: "#8660ff",
          500: "#6d3aff",
          600: "#5a1fff",
          700: "#4a0fe8",
          800: "#3c0cc4",
          900: "#2d099a",
          950: "#1a0562",
        },
        surface: {
          900: "#0d0d1a",
          800: "#12122b",
          700: "#181836",
          600: "#1e1e42",
          500: "#25254e",
        },
      },
      fontFamily: {
        sans: ["Outfit", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(109, 58, 255, 0.35)",
        "glow-lg": "0 0 40px rgba(109, 58, 255, 0.5)",
        "glow-sm": "0 0 10px rgba(109, 58, 255, 0.25)",
        card: "0 8px 32px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #6d3aff 0%, #a855f7 100%)",
        "hero-gradient": "linear-gradient(160deg, #0d0d1a 0%, #1a0562 50%, #0d0d1a 100%)",
        "card-glass": "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(109,58,255,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(109,58,255,0.7)" },
        },
      },
    },
  },
  plugins: [],
};
