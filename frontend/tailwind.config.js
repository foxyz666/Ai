/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        bg: {
          base: "#05060f",
          panel: "#0b0c1c",
          card: "rgba(20, 22, 44, 0.55)",
        },
        neon: {
          purple: "#a855f7",
          violet: "#7c3aed",
          blue: "#38bdf8",
          cyan: "#22d3ee",
          pink: "#ec4899",
        },
      },
      boxShadow: {
        neon: "0 0 24px rgba(168, 85, 247, 0.45), 0 0 60px rgba(56, 189, 248, 0.25)",
        "neon-soft": "0 0 18px rgba(168, 85, 247, 0.25)",
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse at top, rgba(124,58,237,0.18), transparent 55%), radial-gradient(ellipse at bottom right, rgba(56,189,248,0.12), transparent 60%)",
      },
      animation: {
        "pulse-slow": "pulse 3.5s ease-in-out infinite",
        "spin-slow": "spin 6s linear infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.2s linear infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
