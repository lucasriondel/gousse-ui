import type { Config } from "tailwindcss";

/**
 * Partial Tailwind preset owned by gousse-ui — the gousse theme.
 * web spreads it via `presets: [goussePreset]`. `content`, `darkMode`, and
 * `plugins` stay in the CONSUMER's config. Values ported verbatim from
 * packages/web/tailwind.config.ts — only their home moved.
 */
export const goussePreset = {
  theme: {
    extend: {
      colors: {
        gousse: {
          bg: "rgb(var(--gousse-bg) / <alpha-value>)",
          panel: "rgb(var(--gousse-panel) / <alpha-value>)",
          ink: "rgb(var(--gousse-ink) / <alpha-value>)",
          muted: "rgb(var(--gousse-muted) / <alpha-value>)",
          line: "rgb(var(--gousse-line) / <alpha-value>)",
          accent: "rgb(var(--gousse-accent) / <alpha-value>)",
          high: "rgb(var(--gousse-high) / <alpha-value>)",
          medium: "rgb(var(--gousse-medium) / <alpha-value>)",
          low: "rgb(var(--gousse-low) / <alpha-value>)",
        },
      },
      boxShadow: {
        "gousse-sm": "var(--gousse-shadow-sm)",
        "gousse-md": "var(--gousse-shadow-md)",
        "gousse-lg": "var(--gousse-shadow-lg)",
        "gousse-xl": "var(--gousse-shadow-xl)",
      },
      animation: {
        "fade-in": "fadeIn 300ms ease-out forwards",
        "slide-up": "slideUp 300ms ease-out both",
        "slide-out": "slideOut 250ms ease-in forwards",
        "slide-in-right": "slideInRight 180ms ease-out forwards",
        "bounce-subtle": "bounceSubtle 500ms ease-in-out",
        "sparkle-twinkle": "sparkleTwinkle 1.4s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideOut: {
          "0%": {
            opacity: "1",
            transform: "translateX(0)",
            maxHeight: "200px",
          },
          "100%": {
            opacity: "0",
            transform: "translateX(40px)",
            maxHeight: "0",
            paddingTop: "0",
            paddingBottom: "0",
            borderBottomWidth: "0",
          },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        sparkleTwinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(0.82)" },
        },
      },
    },
  },
} satisfies Partial<Config>;
