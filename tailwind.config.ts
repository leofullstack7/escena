import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        fog: "var(--fog)",
        mist: "var(--mist)",
        paper: "var(--paper)",
        copper: "var(--copper)",
        "copper-bright": "var(--copper-bright)",
        teal: "var(--teal)",
        "teal-glow": "var(--teal-glow)",
        danger: "var(--danger)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
      },
      maxWidth: {
        studio: "72rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
