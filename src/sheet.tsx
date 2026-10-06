import type { ComponentProps } from "react";
import { Dialog as SheetPrimitive } from "@base-ui-components/react/dialog";
import { cva } from "class-variance-authority";
import { DialogCloseButton } from "./dialog.js";
import { cn } from "./utils.js";

/**
 * A panel that slides in from an edge of the viewport — shadcn's `sheet`, which
 * is Base UI's `Dialog` with an edge-anchored popup. Restyled onto the gousse
 * tokens so it is the same material as {@link DialogContent}.
 *
 * Structure: Sheet (Root) / SheetTrigger / SheetContent (Portal → Backdrop →
 * Popup) / SheetHeader / SheetTitle / SheetDescription / SheetFooter /
 * SheetClose / SheetCloseButton.
 *
 * **Drawer**: `side="bottom"` is the mobile drawer — a sheet that rises from the
 * bottom edge, capped at most of the viewport's height, with a grab handle drawn
 * on top. It is a sheet rather than a separate swipe-driven primitive: Base UI's
 * swipeable `Drawer` ships after the release this kit pins, and a sheet already
 * owns the focus trap, scroll lock and Escape a drawer needs.
 *
 * Round, but only where it faces the page: the edge flush with the viewport
 * stays square, the edge the content opens toward takes `rounded-3xl`.
 *
 * The slide is a translate, never a size change, and drops to a fade under
 * `prefers-reduced-motion`.
 */

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;

const BACKDROP =
  "fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 " +
  "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none";

const sheet = cva(
  "fixed z-[100] flex flex-col gap-4 border-gousse-line/60 bg-gousse-panel p-6 text-sm text-gousse-ink shadow-gousse-xl outline-hidden " +
    "transition-[transform,opacity] duration-300 [transition-timing-function:cubic-bezier(0.32,0.72,0,1)] " +
    "data-[ending-style]:duration-200 motion-reduce:transition-opacity motion-reduce:data-[starting-style]:translate-none motion-reduce:data-[ending-style]:translate-none " +
    "motion-reduce:data-[starting-style]:opacity-0 motion-reduce:data-[ending-style]:opacity-0",
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-3/4 rounded-l-3xl border-l sm:max-w-sm data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full",
        left: "inset-y-0 left-0 h-full w-3/4 rounded-r-3xl border-r sm:max-w-sm data-[ending-style]:-translate-x-full data-[starting-style]:-translate-x-full",
        top: "inset-x-0 top-0 max-h-[85dvh] rounded-b-3xl border-b data-[ending-style]:-translate-y-full data-[starting-style]:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-3xl border-t pt-8 data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export type SheetSide = "top" | "right" | "bottom" | "left";

export function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: ComponentProps<typeof SheetPrimitive.Popup> & { side?: SheetSide }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className={BACKDROP} />
      <SheetPrimitive.Popup data-side={side} className={cn(sheet({ side }), className)} {...props}>
        {side === "bottom" && (
          <div
            aria-hidden
            className="absolute left-1/2 top-3 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gousse-line"
          />
        )}
        {children}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

/** The corner dismiss button — {@link DialogCloseButton}, which works in any Dialog root. */
export const SheetCloseButton = DialogCloseButton;

export function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1.5 pr-8", className)} {...props} />;
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-lg font-bold tracking-tight text-gousse-ink", className)}
      {...props}
    />
  );
}

export function SheetDescription({
  className,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm font-medium leading-relaxed text-gousse-muted", className)}
      {...props}
    />
  );
}

/** Pinned to the bottom of the sheet by `mt-auto`, however short the body. */
export function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mt-auto flex flex-col gap-2", className)} {...props} />;
}

/** Scrollable body between a fixed header and footer — put long content here. */
export function SheetBody({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("-mx-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-6", className)}
      {...props}
    />
  );
}
