import type { ComponentProps } from "react";
import { cn } from "./utils.js";

/**
 * Loading placeholder, ported from shadcn's `skeleton`: a pulsing block that
 * holds the space a piece of content will take, so the layout doesn't jump when
 * it lands.
 *
 * Painted `bg-gousse-line/60` — the hairline token, lifted — so it reads as
 * "not yet" against both the page and a panel, in either mode.
 *
 * Shape it to its content with `className`: the default is the gousse corner
 * (`rounded-xl`); a line of text wants `h-4`, an avatar `rounded-full size-10`,
 * a button `rounded-full h-9`. Size is always the caller's — a skeleton has no
 * intrinsic dimensions to guess.
 *
 * The pulse stops under `prefers-reduced-motion`; the block stays.
 */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "animate-pulse rounded-xl bg-gousse-line/60 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
