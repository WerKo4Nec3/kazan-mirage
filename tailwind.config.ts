import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm historical palette
        parchment: "#f5f0e8",
        ink: "#2c2416",
        gold: "#c9a84c",
        "gold-dark": "#a07830",
        rust: "#8b3a2a",
        "panel-bg": "#1a1510",
        "panel-border": "#3a2e1e",
      },
    },
  },
  plugins: [],
};

export default config;
