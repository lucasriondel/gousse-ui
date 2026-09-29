import type { ComponentProps, CSSProperties } from "react";
import { cn } from "./utils.js";

/**
 * The waveform a voice agent shows while it listens or speaks. Five looks:
 *
 * - `bars` — a row of rounded bars rising and falling from the baseline.
 * - `mirrored` — the same bars grown out of the centre line, the classic
 *   voice-memo shape.
 * - `dots` — a row of dots bobbing in a travelling wave; the quietest.
 * - `line` — a continuous sine drifting sideways.
 * - `rings` — ripples expanding out of a centre dot, for a round button.
 *
 * Two ways to drive it. By default it *simulates*: each bar runs the
 * `.gousse-wave-*` keyframes from `agent-motion.css` with a staggered delay and
 * a fixed pseudo-random peak, which is right for "the agent is speaking". For a
 * live mic, pass `levels` — one 0–1 amplitude per bar (from a Web Audio
 * `AnalyserNode`, say) — and the bars follow them instead, with a short
 * transition to smooth the frame rate.
 *
 * `state="idle"` settles everything to its floor without unmounting, so the
 * control can sit in place between turns. The colour is `currentColor`.
 */

export type AudioWavesVariant = "bars" | "mirrored" | "dots" | "line" | "rings";

interface AudioWavesProps extends Omit<ComponentProps<"div">, "children"> {
  variant?: AudioWavesVariant;
  state?: "active" | "idle";
  /** Number of bars / dots. */
  count?: number;
  /** Height of the whole mark, px. */
  height?: number;
  /** Live amplitudes, 0–1, one per bar. Overrides the simulation. */
  levels?: readonly number[];
}

// Deterministic peaks, so a simulated wave has a shape rather than a ramp.
const peak = (i: number) => 0.45 + 0.55 * Math.abs(Math.sin(i * 1.7 + 0.4));

export function AudioWaves({
  variant = "bars",
  state = "active",
  count,
  height = 24,
  levels,
  className,
  style,
  ...props
}: AudioWavesProps) {
  const live = levels !== undefined;
  const common = {
    "data-state": state,
    "aria-hidden": props["aria-label"] ? undefined : true,
    role: props["aria-label"] ? "img" : undefined,
    ...props,
  };

  if (variant === "line") {
    return (
      <div
        {...common}
        className={cn("relative overflow-hidden", className)}
        style={{ height, width: height * 4, ...style }}
      >
        <svg
          viewBox="0 0 200 40"
          preserveAspectRatio="none"
          className="gousse-wave-line absolute inset-y-0 left-0 h-full w-[200%]"
        >
          <path
            d={Array.from({ length: 81 }, (_, i) => {
              const x = i * 2.5;
              const y = 20 + (state === "idle" ? 0 : 14) * Math.sin((x / 50) * Math.PI * 2);
              return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(2)}`;
            }).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    );
  }

  if (variant === "rings") {
    return (
      <div
        {...common}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: height, height, ...style }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="gousse-wave-ring absolute inset-0 rounded-full border-2 border-current"
            style={{ "--i": i } as CSSProperties}
          />
        ))}
        <span className="relative size-1/3 rounded-full bg-current" />
      </div>
    );
  }

  const n = count ?? (variant === "dots" ? 5 : 7);
  const barWidth = Math.max(2, Math.round(height / 8));

  return (
    <div
      {...common}
      className={cn(
        "inline-flex justify-center",
        variant === "bars" ? "items-end" : "items-center",
        className,
      )}
      style={{ height, gap: variant === "dots" ? barWidth * 1.5 : barWidth, ...style }}
    >
      {Array.from({ length: n }, (_, i) => {
        if (variant === "dots") {
          return (
            <span
              key={i}
              className="gousse-wave-dot shrink-0 rounded-full bg-current"
              style={{ width: barWidth * 1.5, height: barWidth * 1.5, "--i": i } as CSSProperties}
            />
          );
        }
        const level = live ? Math.max(0.12, Math.min(1, levels[i] ?? 0)) : undefined;
        return (
          <span
            key={i}
            className={cn(
              "shrink-0 rounded-full bg-current",
              live ? "transition-[height] duration-100 ease-out" : "gousse-wave-bar h-full",
              variant === "bars" && !live && "origin-bottom",
            )}
            style={
              {
                width: barWidth,
                "--i": i,
                "--peak": peak(i).toFixed(2),
                ...(live ? { height: `${(state === "idle" ? 0.12 : level!) * 100}%` } : undefined),
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
