import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { cn } from "./utils.js";

/**
 * A tiny dot-matrix activity mark — the thing that sits beside "Thinking" and
 * says *working* with more character than a spinner. Four families of
 * layouts, each with a few motions:
 *
 * - **lattice** — a 3×3 grid: a wave out of the centre, a diagonal sweep, a
 *   column marching across, a scrambled flicker.
 * - **ring** — eight dots on a circle: a chase, a pulse, a comet with a tail.
 * - **lens** — three dots at different depths, blur standing in for distance:
 *   focus handing round, or the trio orbiting.
 * - **morph** — a ring that breathes in and out as it turns, or blooms.
 *
 * The split of work: this file lays the dots out and gives each a *phase* in
 * `[0, 1)`; `agent-motion.css` owns the keyframes. Each dot starts its phase's
 * worth into the cycle (a negative `animation-delay`), so the whole pattern
 * comes from the phases and is already moving on the first frame. Reduced
 * motion freezes it on that frame, which still shows the pattern's shape.
 *
 * Dots are `currentColor` — set `className="text-gousse-accent"` to tint.
 * With `pill`, the orb and its `label` sit in a status pill; otherwise the orb
 * is `role="img"` named by `label`.
 */

type Dot = { x: number; y: number; p: number; r?: number };
type Motion = "fade" | "pulse" | "comet" | "bloom" | "focus";
type Spec = { dots: Dot[]; motion: Motion; spin?: "turn" | "breathe"; duration?: number };

const grid = (phase: (col: number, row: number) => number): Dot[] =>
  Array.from({ length: 9 }, (_, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    return { x: 25 + col * 25, y: 25 + row * 25, p: phase(col, row) };
  });

const ring = (count: number, radius: number, phase: (i: number) => number, r?: number): Dot[] =>
  Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    return { x: 50 + Math.cos(a) * radius, y: 50 + Math.sin(a) * radius, p: phase(i), r };
  });

// A fixed shuffle, so "scrambled" is the same scramble on every render.
const SCRAMBLE = [0.62, 0.13, 0.87, 0.38, 0.0, 0.75, 0.25, 0.5, 0.94];

const VARIANTS = {
  "lattice-wave": {
    motion: "fade",
    dots: grid((c, r) => 1 - Math.max(Math.abs(c - 1), Math.abs(r - 1)) / 3),
  },
  "lattice-sweep": { motion: "fade", dots: grid((c, r) => 1 - (c + r) / 5) },
  "lattice-march": { motion: "pulse", dots: grid((c) => 1 - c / 3) },
  "lattice-flicker": { motion: "fade", dots: grid((c, r) => SCRAMBLE[r * 3 + c]!), duration: 2.4 },
  "ring-chase": { motion: "fade", dots: ring(8, 32, (i) => 1 - i / 8) },
  "ring-pulse": { motion: "pulse", dots: ring(8, 32, (i) => 1 - i / 8), duration: 2 },
  "ring-comet": { motion: "comet", dots: ring(8, 32, (i) => 1 - i / 8), duration: 1.2 },
  "lens-focus": {
    motion: "focus",
    dots: ring(3, 22, (i) => 1 - i / 3, 1.5),
    duration: 2.1,
  },
  "lens-orbit": {
    motion: "focus",
    dots: ring(3, 22, (i) => 1 - i / 3, 1.5),
    spin: "turn",
    duration: 1.8,
  },
  "morph-breathe": {
    motion: "fade",
    dots: ring(8, 32, (i) => (i % 2) * 0.5),
    spin: "breathe",
    duration: 1.8,
  },
  "morph-bloom": {
    motion: "bloom",
    dots: [
      { x: 50, y: 50, p: 0, r: 2 },
      { x: 50, y: 50, p: 0.33, r: 2 },
      { x: 50, y: 50, p: 0.66, r: 2 },
    ],
    duration: 2.4,
  },
} satisfies Record<string, Spec>;

export type OrbVariant = keyof typeof VARIANTS;
export const ORB_VARIANTS = Object.keys(VARIANTS) as OrbVariant[];

interface OrbProps extends Omit<ComponentProps<"span">, "children"> {
  variant?: OrbVariant;
  /** Edge length in px. Dots scale with it. */
  size?: number;
  /** Accessible name; also the pill's text. */
  label?: ReactNode;
  /** Wrap the orb and `label` in a status pill. */
  pill?: boolean;
  /** Seconds per cycle; each variant has its own default. */
  duration?: number;
}

export function Orb({
  variant = "lattice-wave",
  size = 20,
  label = "Thinking",
  pill = false,
  duration,
  className,
  style,
  ...props
}: OrbProps) {
  const spec: Spec = VARIANTS[variant];
  const dot = Math.max(2, size * 0.14);

  const stage = (
    <span
      role={pill ? undefined : "img"}
      aria-hidden={pill || undefined}
      aria-label={pill ? undefined : typeof label === "string" ? label : "Working"}
      data-motion={spec.motion}
      data-spin={spec.spin}
      className={cn("gousse-orb inline-block shrink-0", !pill && className)}
      style={
        {
          width: size,
          height: size,
          "--orb-dur": `${duration ?? spec.duration ?? 1.6}s`,
          ...(pill ? undefined : style),
        } as CSSProperties
      }
      {...(pill ? undefined : props)}
    >
      {spec.dots.map((d, i) => {
        const edge = dot * (d.r ?? 1);
        return (
          <span
            key={i}
            className="gousse-orb-dot"
            style={
              {
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: edge,
                height: edge,
                "--p": d.p.toFixed(3),
              } as CSSProperties
            }
          />
        );
      })}
    </span>
  );

  if (!pill) return stage;

  return (
    <span
      role="status"
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-gousse-line bg-gousse-panel pl-2 pr-3.5 text-sm font-medium text-gousse-ink shadow-gousse-sm",
        className,
      )}
      style={style}
      {...props}
    >
      {stage}
      <span>{label}</span>
    </span>
  );
}
