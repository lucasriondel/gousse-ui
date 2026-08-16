import type { ComponentProps } from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { X } from "lucide-react";
import { cn } from "./utils.js";

/**
 * shadcn-flavoured wrappers over Base UI's `Dialog`, restyled with gousse
 * tokens so a modal matches the app's other surfaces (`bg-gousse-panel`,
 * `border-gousse-line`, `shadow-gousse-xl`).
 *
 * Structure: Dialog (Root) / DialogTrigger / DialogContent (Portal → Backdrop →
 * Popup) / DialogHeader / DialogTitle / DialogDescription / DialogFooter /
 * DialogClose.
 *
 * The panel is `rounded-3xl` rather than the popover's `rounded-2xl` — a dialog
 * is the largest surface gousse paints, and the radius scales with the box so
 * the arc reads the same at any size.
 *
 * Base UI owns the machinery a hand-rolled modal has to re-solve: portalling
 * past `overflow-hidden` ancestors, focus trapping, scroll locking, Escape, and
 * the `data-[starting-style]`/`data-[ending-style]` hooks the enter/exit
 * transitions key off. Nothing here reimplements it.
 *
 * **Blocking gates**: pass `dismissible={false}` to {@link Dialog}. Onboarding
 * and setup gates have no exit — the user finishes the flow or nothing — so the
 * escape key, the backdrop click and focus-out are all refused in one place
 * rather than by omitting a handler at each call site. Programmatic closes
 * (your own `open` state, {@link DialogClose}) still work.
 */

export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

/** Dismissal reasons that come from the user rather than from your own state. */
const USER_DISMISSALS = ["escape-key", "outside-press", "focus-out"];

/**
 * Dialog root. Controlled via `open`/`onOpenChange` like Base UI's, plus
 * `dismissible` — set it to `false` and every user-initiated close (Escape,
 * backdrop, focus-out) is dropped before it reaches `onOpenChange`.
 */
export function Dialog({
  dismissible = true,
  onOpenChange,
  ...props
}: ComponentProps<typeof BaseDialog.Root> & { dismissible?: boolean }) {
  return (
    <BaseDialog.Root
      disablePointerDismissal={!dismissible}
      onOpenChange={(open, details) => {
        if (!dismissible && !open && USER_DISMISSALS.includes(details.reason ?? "")) {
          details.cancel();
          return;
        }
        onOpenChange?.(open, details);
      }}
      {...props}
    />
  );
}

/** Enter/exit animation keyed off Base UI's data-open/closed + starting/ending. */
const POPUP_ANIM =
  "transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] " +
  "data-[starting-style]:translate-y-2 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 " +
  "data-[ending-style]:translate-y-2 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 " +
  "motion-reduce:transition-none motion-reduce:data-[starting-style]:translate-y-0 motion-reduce:data-[starting-style]:scale-100";

const POPUP_SURFACE =
  "relative z-[100] w-full max-w-md rounded-3xl border border-gousse-line/60 bg-gousse-panel p-7 text-gousse-ink shadow-gousse-xl outline-hidden";

const BACKDROP =
  "fixed inset-0 z-[100] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 " +
  "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 motion-reduce:transition-none";

/**
 * The dialog surface, backdrop included. Centres itself in a scrollable
 * viewport rather than by transform, so a panel taller than the window scrolls
 * instead of overflowing off both edges.
 */
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop className={BACKDROP} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain p-4">
        <BaseDialog.Popup className={cn(POPUP_SURFACE, POPUP_ANIM, className)} {...props}>
          {children}
        </BaseDialog.Popup>
      </div>
    </BaseDialog.Portal>
  );
}

/** Stacked title + description block. Centre it with `className="text-center"`. */
export function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      className={cn("text-lg font-bold tracking-tight text-gousse-ink", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      className={cn("text-sm font-medium leading-relaxed text-gousse-muted", className)}
      {...props}
    />
  );
}

/** Action row. Right-aligned on desktop, full-width stacked on narrow screens. */
export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-2",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The corner dismiss button. A separate export from {@link DialogClose} — that
 * one is the unstyled Base UI part, for wrapping your own footer buttons.
 */
export function DialogCloseButton({
  className,
  ...props
}: ComponentProps<typeof BaseDialog.Close>) {
  return (
    <BaseDialog.Close
      aria-label="Close"
      className={cn(
        "absolute right-4 top-4 grid size-8 place-items-center rounded-full text-gousse-muted transition-[background,transform] duration-150 hover:bg-gousse-line/60 hover:text-gousse-ink active:scale-[0.96]",
        className,
      )}
      {...props}
    >
      <X size={16} aria-hidden />
    </BaseDialog.Close>
  );
}
