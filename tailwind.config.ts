import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(from var(--color-paper) r g b / <alpha-value>)",
        ink: "rgb(from var(--color-ink) r g b / <alpha-value>)",
        muted: "rgb(from var(--color-muted) r g b / <alpha-value>)",
        accent: "rgb(from var(--color-accent) r g b / <alpha-value>)",
        brand: "#ff5125",
        mist: "rgb(from var(--color-mist) r g b / <alpha-value>)",
        peach: "rgb(from var(--color-peach) r g b / <alpha-value>)",
        surface: "rgb(from var(--color-surface) r g b / <alpha-value>)",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-modernist)", "sans-serif"],
        action: ["var(--font-vcr)", "ui-monospace", "monospace"],
      },
      transitionTimingFunction: { out: "cubic-bezier(.22,.68,0,1.01)" },
    },
  },
} satisfies Config;
