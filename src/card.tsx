import type { ComponentProps } from "react";
import { cn } from "./utils.js";

/**
 * A plain content surface, ported from shadcn's `card` and restyled onto the
 * gousse tokens: `bg-gousse-panel` on a hairline `border-gousse-line/60`, the
 * same pairing {@link SettingsCard} and the dialog panel use, so a card set
 * beside either reads as the same material.
 *
 * Structure: Card / CardHeader (CardTitle, CardDescription, CardAction) /
 * CardContent / CardFooter.
 *
 * Shaped `rounded-3xl`: a card is a surface, not a control, and gousse scales
 * the radius with the box. `overflow-hidden` is what makes the radius bite on a
 * full-bleed child — an image first in the card would otherwise paint its
 * square corners over the arc.
 *
 * Spacing is one knob. `--card-spacing` drives the vertical rhythm *and* the
 * horizontal inset of every section, so `size="sm"` tightens the whole card at
 * once instead of each part carrying its own padding.
 */
export function Card({
  className,
  size = "default",
  ...props
}: ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-3xl border border-gousse-line/60 bg-gousse-panel py-(--card-spacing) text-sm text-gousse-ink shadow-gousse-sm [--card-spacing:--spacing(6)] data-[size=sm]:[--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Title + description, with an optional {@link CardAction} pinned top-right.
 * The grid only grows a second column when an action is present, so a header
 * without one keeps the full width for its text.
 */
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-base font-bold tracking-tight text-gousse-ink group-data-[size=sm]/card:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-sm font-medium leading-relaxed text-gousse-muted", className)}
      {...props}
    />
  );
}

/** A control in the header's top-right corner — a menu, a badge, a link. */
export function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-(--card-spacing)", className)} {...props} />
  );
}

/** Action row. Give it `border-t` to rule it off; the padding follows the card's spacing. */
export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 px-(--card-spacing) [.border-t]:border-gousse-line/60 [.border-t]:pt-(--card-spacing)",
        className,
      )}
      {...props}
    />
  );
}
