import type { Config } from "tailwindcss";
import { goussePreset } from "./src/preset";

/**
 * Tailwind config for Storybook only. The library ships no compiled CSS — web
 * owns its own config and spreads `goussePreset`. Here we compile utilities for
 * the primitives + their stories so the design system renders in isolation.
 */
export default {
  content: ["./src/**/*.{ts,tsx}", "./.storybook/**/*.{ts,tsx}"],
  darkMode: "class",
  presets: [goussePreset],
  plugins: [],
} satisfies Config;
