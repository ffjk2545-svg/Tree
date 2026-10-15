import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        leaf: { 50: "#f0fdf4", 100: "#dcfce7", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d" },
        bark: { 400: "#a16207", 500: "#854d0e", 600: "#713f12" },
        cream: "#fffbeb",
      },
      fontFamily: { display: ["var(--font-display)", "ui-rounded", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
