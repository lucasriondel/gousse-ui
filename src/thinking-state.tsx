import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "./utils.js";

/**
 * The one-line status an agent shows while it works — "Thinking…" with a light
 * band sweeping the label, and a running clock beside it. When the work lands,
 * it settles into a quiet past tense: "Thought for 4s".
 *
 * The shimmer lives in `agent-motion.css` (`.gousse-shimmer`): text clipped to a
 * moving gradient of the muted and ink tokens, so it reads as alive without a
 * spinner competing with the answer that follows. Under reduced motion it
 * holds still as plain muted text.
 *
 * The clock is optional and derived — pass `startedAt` (a `Date.now()` stamp)
 * and it ticks each second while `status` is `"thinking"`; pass `duration` (ms)
 * to fix the number, which is what a finished message replayed from history
 * wants. `role="status"` makes the transition to done polite for screen readers.
 *
 * The root is a `<span>` so it can sit inside a button — {@link Reasoning} uses
 * it as its disclosure trigger.
 */

export type ThinkingStatus = "thinking" | "done";

interface ThinkingStateProps extends Omit<ComponentProps<"span">, "children"> {
  status?: ThinkingStatus;
  /** Label while working. Defaults to "Thinking". */
  label?: ReactNode;
  /** Label once done; receives the formatted duration. */
  doneLabel?: (elapsed: string) => ReactNode;
  /** `Date.now()` at the start of the run — drives the live clock. */
  startedAt?: number;
  /** Fixed elapsed time in ms; wins over `startedAt`. */
  duration?: number;
  /** Replaces the sparkle glyph; `null` drops it. */
  icon?: ReactNode;
}

export function formatElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

export function useElapsed(startedAt: number | undefined, running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running || startedAt === undefined) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running, startedAt]);
  return startedAt === undefined ? 0 : now - startedAt;
}

export function ThinkingState({
  status = "thinking",
  label = "Thinking",
  doneLabel = (elapsed) => `Thought for ${elapsed}`,
  startedAt,
  duration,
  icon,
  className,
  ...props
}: ThinkingStateProps) {
  const thinking = status === "thinking";
  const live = useElapsed(startedAt, thinking && duration === undefined);
  const elapsed = duration ?? live;
  const showClock = duration !== undefined || startedAt !== undefined;

  const glyph =
    icon === undefined ? (
      <Sparkles
        size={14}
        aria-hidden
        className={cn(
          "shrink-0 transition-colors",
          thinking ? "animate-sparkle-twinkle text-gousse-accent" : "text-gousse-muted",
        )}
      />
    ) : (
      icon
    );

  return (
    <span
      role="status"
      data-status={status}
      className={cn("inline-flex items-center gap-2 text-sm font-medium", className)}
      {...props}
    >
      {glyph}
      {thinking ? (
        <>
          <span className="gousse-shimmer">{label}…</span>
          {showClock ? (
            <span className="tabular-nums text-xs text-gousse-muted">{formatElapsed(elapsed)}</span>
          ) : null}
        </>
      ) : (
        <span className="text-gousse-muted">
          {showClock ? doneLabel(formatElapsed(elapsed)) : doneLabel("a moment")}
        </span>
      )}
    </span>
  );
}
