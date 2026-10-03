import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { paper: "#ffffff", ink: "#000000", muted: "#666666", accent: "#b63312", brand: "#ff5125", mist: "#f4f4f4", peach: "#fff0ea" },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-modernist)", "sans-serif"],
        action: ["var(--font-vcr)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: { out: "cubic-bezier(.22,.68,0,1.01)" },
    },
  },
} satisfies Config;
