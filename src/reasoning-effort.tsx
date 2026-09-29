import { useRef, useState, type ComponentProps, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "./utils.js";

/**
 * How hard the model should think — a stepped slider over a handful of
 * levels (Low → Extra high by default). A pill track fills from the left up to
 * the chosen stop; the ticks grow taller toward the high end so the scale
 * reads as "more" without a legend.
 *
 * Drag the thumb, click anywhere on the track to snap, or use the keyboard:
 * arrows step, Home/End jump to the ends. While dragging or focused, a label
 * floats above the track naming the level (and the model, if given) — the
 * value is spelled out where the eye already is, instead of in a caption
 * below it.
 *
 * `role="slider"` with `aria-valuetext` set to the level name, so assistive
 * tech hears "High", not "2". Controlled (`value` + `onValueChange`) or not
 * (`defaultValue`); values are level indices.
 */

export const DEFAULT_EFFORT_LEVELS = ["Low", "Medium", "High", "Extra high"] as const;

interface ReasoningEffortProps
  extends Omit<ComponentProps<"div">, "defaultValue" | "onChange" | "children"> {
  levels?: readonly string[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Prefix for the floating label — "Opus 5.5 · High". */
  modelLabel?: string;
  disabled?: boolean;
  /** Accessible name. */
  label?: string;
}

export function ReasoningEffort({
  levels = DEFAULT_EFFORT_LEVELS,
  value: controlled,
  defaultValue = 1,
  onValueChange,
  modelLabel,
  disabled = false,
  label = "Reasoning effort",
  className,
  ...props
}: ReasoningEffortProps) {
  const [inner, setInner] = useState(defaultValue);
  const [dragging, setDragging] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const value = controlled ?? inner;
  const max = levels.length - 1;
  const pct = max === 0 ? 100 : (value / max) * 100;

  const commit = (next: number) => {
    const v = Math.max(0, Math.min(max, next));
    if (v === value) return;
    if (controlled === undefined) setInner(v);
    onValueChange?.(v);
  };

  const fromPointer = (clientX: number) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    // Stops sit inset by half the thumb so the ends are reachable.
    const inset = 14;
    const ratio = (clientX - rect.left - inset) / Math.max(1, rect.width - inset * 2);
    commit(Math.round(ratio * max));
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    fromPointer(e.clientX);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 };
    if (e.key in step) commit(value + step[e.key]!);
    else if (e.key === "Home") commit(0);
    else if (e.key === "End") commit(max);
    else return;
    e.preventDefault();
  };

  const levelName = levels[value] ?? "";

  return (
    <div className={cn("group/effort relative inline-flex w-56 flex-col pt-7", className)} {...props}>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-gousse-ink px-2 py-0.5 text-[11px] font-semibold text-gousse-bg shadow-gousse-md transition-[opacity,translate,filter] duration-200 ease-out",
          dragging
            ? "translate-y-0 opacity-100 blur-0"
            : "translate-y-1 opacity-0 blur-[2px] group-focus-within/effort:translate-y-0 group-focus-within/effort:opacity-100 group-focus-within/effort:blur-0",
        )}
        style={{ left: `calc(14px + (100% - 28px) * ${pct / 100})` }}
      >
        {modelLabel ? <span className="opacity-60">{modelLabel} · </span> : null}
        {levelName}
      </span>
      <div
        ref={track}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={modelLabel ? `${modelLabel}, ${levelName}` : levelName}
        aria-disabled={disabled || undefined}
        onKeyDown={disabled ? undefined : onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => dragging && fromPointer(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        className={cn(
          "relative h-8 w-full touch-none select-none rounded-full bg-gousse-line/50 outline-hidden transition-shadow focus-visible:ring-2 focus-visible:ring-gousse-ink/30",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        {/* Fill — reaches the thumb's far edge so it wraps it. */}
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 rounded-full bg-gousse-accent/20 transition-[width] duration-200 ease-out"
          style={{ width: `calc(28px + (100% - 28px) * ${pct / 100})` }}
        />
        {levels.map((_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "absolute top-1/2 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",
              i <= value ? "bg-gousse-accent/70" : "bg-gousse-muted/40",
            )}
            style={{
              left: `calc(14px + (100% - 28px) * ${max === 0 ? 1 : i / max})`,
              height: 5 + (max === 0 ? 0 : (i / max) * 5),
            }}
          />
        ))}
        <span
          aria-hidden
          className={cn(
            "absolute top-1 h-6 -translate-x-1/2 rounded-full bg-gousse-panel shadow-gousse-md ring-1 ring-gousse-line transition-[left,width] duration-200 ease-out",
            dragging ? "w-9" : "w-7",
          )}
          style={{ left: `calc(14px + (100% - 28px) * ${pct / 100})` }}
        />
      </div>
      <span className="mt-1.5 flex justify-between px-1 text-[11px] font-medium text-gousse-muted">
        <span>{levels[0]}</span>
        <span>{levels[max]}</span>
      </span>
    </div>
  );
}
