import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#080a12",
          900: "#0c0f1a",
          850: "#121624",
          800: "#171c2e",
          700: "#1f2740",
          600: "#2a3354",
        },
        brand: {
          DEFAULT: "#6d5efc",
          400: "#8b7dff",
          500: "#6d5efc",
          600: "#5a48f0",
        },
        accent: {
          DEFAULT: "#22e0a1",
          glow: "#16c98c",
        },
        flame: "#ff7a45",
        gold: "#ffc24b",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(109,94,252,0.35), 0 12px 40px -12px rgba(109,94,252,0.55)",
        card: "0 8px 30px -12px rgba(0,0,0,0.6)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease both",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
