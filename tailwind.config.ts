import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { paper: "#f8f8f4", ink: "#20241f", muted: "#5d6559", olive: "#506243", mist: "#eceee6" },
      fontFamily: { sans: ["var(--font-general)", "sans-serif"] },
      transitionTimingFunction: { out: "cubic-bezier(.22,.68,0,1.01)" },
    },
  },
} satisfies Config;
