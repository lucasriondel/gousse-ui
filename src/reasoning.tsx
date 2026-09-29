import { useState, type ComponentProps, type ReactNode } from "react";
import { Collapsible } from "@base-ui-components/react/collapsible";
import { ChevronRight } from "lucide-react";
import { ThinkingState, type ThinkingStatus } from "./thinking-state.js";
import { cn } from "./utils.js";

/**
 * The agent's visible chain of thought: a {@link ThinkingState} line that
 * opens onto the reasoning trace behind it. While the model is thinking the
 * trace is open and streaming; once it is done, it folds shut to "Thought for
 * 12s" so the answer, not the working, is what the eye lands on.
 *
 * Base UI's `Collapsible` owns the disclosure — the trigger's `aria-expanded`,
 * the panel's `hidden` state and its measured height, which it publishes as
 * `--collapsible-panel-height` so the fold animates without a fixed pixel
 * value. `hiddenUntilFound` keeps a folded trace findable with the browser's
 * find-in-page.
 *
 * The trace is quoted, not spoken: a left rule and muted ink set it apart from
 * the answer. Pass the trace as `children` — plain text, a list of
 * {@link ReasoningStep}s, or a {@link StreamingText}.
 *
 * Uncontrolled by default: it opens when `status` turns to `"thinking"` and
 * folds when it turns to `"done"`, and the reader can toggle it in between.
 * Pass `open`/`onOpenChange` to take over and fold it on your own schedule.
 */

interface ReasoningProps extends Omit<ComponentProps<typeof Collapsible.Root>, "children"> {
  status?: ThinkingStatus;
  startedAt?: number;
  duration?: number;
  label?: ReactNode;
  doneLabel?: (elapsed: string) => ReactNode;
  children: ReactNode;
}

export function Reasoning({
  status = "thinking",
  startedAt,
  duration,
  label,
  doneLabel,
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
  className,
  children,
  ...props
}: ReasoningProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen ?? status === "thinking");
  // Follow the run: open while thinking, fold once done. Only on a change of
  // status, so a reader's own toggle holds until the next transition.
  const [seen, setSeen] = useState(status);
  if (seen !== status) {
    setSeen(status);
    setInnerOpen(status === "thinking");
  }
  const open = controlledOpen ?? innerOpen;

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={(next, details) => {
        setInnerOpen(next);
        onOpenChange?.(next, details);
      }}
      className={cn("group/reasoning flex flex-col text-left", className)}
      {...props}
    >
      <Collapsible.Trigger className="-mx-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-gousse-line/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30">
        <ThinkingState
          status={status}
          startedAt={startedAt}
          duration={duration}
          label={label}
          doneLabel={doneLabel}
          role="none"
        />
        <ChevronRight
          size={14}
          aria-hidden
          className="text-gousse-muted transition-transform duration-200 group-data-[open]/reasoning:rotate-90"
        />
      </Collapsible.Trigger>
      <Collapsible.Panel
        hiddenUntilFound
        className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none"
      >
        <div className="ml-[7px] mt-1 border-l border-gousse-line pb-1 pl-4 text-sm leading-relaxed text-gousse-muted">
          {children}
        </div>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

/**
 * One step of a structured trace — a short title with an optional detail line.
 * `status` marks the step still in progress with the shimmer.
 */
export function ReasoningStep({
  title,
  status = "done",
  className,
  children,
  ...props
}: Omit<ComponentProps<"div">, "title"> & { title: ReactNode; status?: ThinkingStatus }) {
  return (
    <div className={cn("py-1", className)} {...props}>
      <div
        className={cn("font-medium", status === "thinking" ? "gousse-shimmer" : "text-gousse-ink")}
      >
        {title}
      </div>
      {children ? <div className="mt-0.5">{children}</div> : null}
    </div>
  );
}
