import type { ComponentProps, ReactNode } from "react";
import { Toast as ToastPrimitive } from "@base-ui-components/react/toast";
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert, X } from "lucide-react";
import { cn } from "./utils.js";

/**
 * shadcn-flavoured wrappers over Base UI's `Toast`, restyled onto the gousse
 * tokens: a `rounded-2xl` panel (`bg-gousse-panel`, `border-gousse-line`,
 * `shadow-gousse-xl`), stacked bottom-right, that fans out on hover.
 *
 * **Use it in two lines.** Mount one {@link Toaster} near the root, then call
 * the module-level {@link toast} manager from anywhere — an event handler, a
 * mutation callback, code outside React entirely:
 *
 * ```tsx
 * toast.add({ title: "Saved", type: "success" });
 * toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Failed" });
 * ```
 *
 * `type` picks the leading icon and its colour: `success` (`gousse-low`),
 * `error` (`gousse-high`), `warning` (`gousse-medium`), `info` (`gousse-muted`)
 * and `loading` (a spinning ring). Any other value, or none, draws no icon.
 * Pass `actionProps: { children: "Undo", onClick }` for an inline action.
 *
 * Base UI owns the hard parts: the polite/assertive live region, pause on hover
 * and on window blur, swipe-to-dismiss, the `limit` that evicts the oldest, and
 * the per-toast `--toast-index`/`--toast-offset-y` vars the stacking transform
 * below is written against. The parts are exported too, for a custom list.
 */

/** The shared manager the default {@link Toaster} listens to. */
export const toast = ToastPrimitive.createToastManager();
export const createToastManager = ToastPrimitive.createToastManager;
export const useToastManager = ToastPrimitive.useToastManager;

export const ToastProvider = ToastPrimitive.Provider;
export function ToastPortal(props: ComponentProps<typeof ToastPrimitive.Portal>) {
  return <ToastPrimitive.Portal {...props} />;
}

export function ToastViewport({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Viewport>) {
  return (
    <ToastPrimitive.Viewport
      className={cn(
        "pointer-events-none fixed inset-x-4 bottom-4 z-[110] mx-auto w-auto max-w-sm outline-hidden sm:left-auto sm:right-4 sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Collapsed, each toast behind the front one sits `--peek` higher and 10%
 * smaller; expanded (hover/focus on the stack), each moves to its real offset.
 * Enter and exit slide off the bottom edge, or off the side it was swiped to.
 */
const TOAST_ROOT = [
  "group/toast pointer-events-auto absolute bottom-0 right-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom select-none rounded-2xl border border-gousse-line bg-gousse-panel text-gousse-ink shadow-gousse-xl outline-hidden will-change-transform focus-visible:ring-2 focus-visible:ring-gousse-accent",
  "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
  "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
  /* Bridges the gap between expanded toasts so the pointer never falls through and collapses the stack. */
  "after:absolute after:left-0 after:top-full after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
  "data-[expanded]:h-(--toast-height) data-[expanded]:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
  "data-[limited]:opacity-0 data-[starting-style]:[transform:translateY(150%)]",
  "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
  "data-[ending-style]:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
  "data-[ending-style]:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
  "data-[ending-style]:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
  "data-[ending-style]:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
  "motion-reduce:[transition:opacity_200ms] motion-reduce:data-[starting-style]:opacity-0 motion-reduce:data-[ending-style]:opacity-0",
].join(" ");

export function Toast({ className, ...props }: ComponentProps<typeof ToastPrimitive.Root>) {
  return <ToastPrimitive.Root className={cn(TOAST_ROOT, className)} {...props} />;
}

/** Fades the toasts behind the front one so only its copy is legible while stacked. */
export function ToastContent({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Content>) {
  return (
    <ToastPrimitive.Content
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden px-4 py-3.5 transition-opacity duration-250 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] data-[behind]:opacity-0 data-[expanded]:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

export function ToastTitle({ className, ...props }: ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      className={cn("text-sm font-bold tracking-tight text-gousse-ink", className)}
      {...props}
    />
  );
}

export function ToastDescription({
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      className={cn("text-sm font-medium leading-snug text-gousse-muted", className)}
      {...props}
    />
  );
}

/** The inline action, sized as a compact secondary pill. Renders nothing without `actionProps`. */
export function ToastAction({ className, ...props }: ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      className={cn(
        "inline-flex h-8 shrink-0 items-center rounded-full border border-gousse-line bg-gousse-panel px-3 text-xs font-medium text-gousse-ink transition-[transform,colors] hover:bg-gousse-bg active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-accent",
        className,
      )}
      {...props}
    />
  );
}

export function ToastClose({
  className,
  children,
  ...props
}: ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      aria-label="Dismiss"
      className={cn(
        "relative grid size-7 shrink-0 place-items-center rounded-full text-gousse-muted transition-[background,transform] duration-150 after:absolute after:-inset-1.5 after:content-[''] hover:bg-gousse-line/60 hover:text-gousse-ink active:scale-[0.96]",
        className,
      )}
      {...props}
    >
      {children ?? <X size={14} aria-hidden />}
    </ToastPrimitive.Close>
  );
}

const TYPE_ICONS: Record<string, ReactNode> = {
  success: <CircleCheck size={16} className="text-gousse-low" aria-hidden />,
  error: <CircleAlert size={16} className="text-gousse-high" aria-hidden />,
  warning: <TriangleAlert size={16} className="text-gousse-medium" aria-hidden />,
  info: <Info size={16} className="text-gousse-muted" aria-hidden />,
  loading: (
    <LoaderCircle
      size={16}
      className="animate-spin text-gousse-accent motion-reduce:animate-none"
      aria-hidden
    />
  ),
};

/** The leading icon for a toast `type`, or nothing for an unknown/absent one. */
export function ToastIcon({ type }: { type: string | undefined }) {
  const icon = type ? TYPE_ICONS[type] : undefined;
  return icon ? <span className="shrink-0">{icon}</span> : null;
}

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();
  return toasts.map((item) => (
    <Toast key={item.id} toast={item}>
      <ToastContent>
        <ToastIcon type={item.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

/**
 * Provider + portalled viewport + the default toast list, in one. Mount it once,
 * wrapping the app (or beside it). Pass `toastManager` to listen to a manager
 * other than the shared {@link toast}, e.g. one per test or per story.
 */
export function Toaster({
  children,
  toastManager = toast,
  ...props
}: ComponentProps<typeof ToastPrimitive.Provider>) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager} {...props}>
      {children}
      <ToastPrimitive.Portal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
