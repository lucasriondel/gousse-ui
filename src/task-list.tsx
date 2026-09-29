import { useState, type ComponentProps, type ReactNode } from "react";
import { Check, ChevronRight, Circle, X } from "lucide-react";
import { cn } from "./utils.js";

/**
 * The to-do list an agent keeps while it works a multi-step job — each task
 * pending, running, done, failed or skipped, with a header counting progress.
 *
 * The status marker carries the state; the label only dims or strikes through
 * behind it. A running task spins a small ring in the accent, a done task
 * fills with the `low` (good) hue and a failed one with `high`, the same
 * semantic tokens Notice uses, so "green means done" holds across the kit.
 *
 * Rendered as an `<ol>` — order is meaningful here, and the list's length is
 * announced. The running row is marked `aria-current="step"`.
 *
 * The header folds the list (`collapsible`, on by default): folded, it still
 * shows the count, the bar and the task in progress, so a long job can shrink
 * to one line without hiding what the agent is doing right now.
 */

export type TaskStatus = "pending" | "running" | "done" | "failed" | "skipped";

export interface Task {
  id: string;
  label: ReactNode;
  status: TaskStatus;
  /** A quieter second line — the file touched, the error hit. */
  detail?: ReactNode;
}

interface TaskListProps extends Omit<ComponentProps<"section">, "title"> {
  tasks: readonly Task[];
  /** Heading; defaults to "Tasks". Pass `null` to drop the header entirely. */
  title?: ReactNode;
  /** Let the header fold the list. */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function TaskList({
  tasks,
  title = "Tasks",
  collapsible = true,
  defaultOpen = true,
  className,
  ...props
}: TaskListProps) {
  const [open, setOpen] = useState(defaultOpen);
  const shown = open || !collapsible;
  const running = tasks.find((t) => t.status === "running");
  const settled = tasks.filter((t) => t.status === "done" || t.status === "skipped").length;
  const pct = tasks.length ? (settled / tasks.length) * 100 : 0;

  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-gousse-line bg-gousse-panel p-4 text-left",
        className,
      )}
      {...props}
    >
      {title !== null ? (
        <header className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-gousse-ink">
              {collapsible ? (
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpen((o) => !o)}
                  className="-mx-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 transition-colors hover:bg-gousse-line/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30"
                >
                  <ChevronRight
                    size={14}
                    aria-hidden
                    className={cn("text-gousse-muted transition-transform duration-200", open && "rotate-90")}
                  />
                  {title}
                </button>
              ) : (
                title
              )}
            </h3>
            <span className="tabular-nums text-xs text-gousse-muted">
              {settled} of {tasks.length}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={tasks.length}
            aria-valuenow={settled}
            className="h-1 overflow-hidden rounded-full bg-gousse-line/60"
          >
            <div
              className="h-full rounded-full bg-gousse-low transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </header>
      ) : null}
      {shown ? (
        <ol className="flex flex-col gap-0.5">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ol>
      ) : running ? (
        <ol className="flex flex-col">
          <TaskItem task={running} />
        </ol>
      ) : null}
    </section>
  );
}

function TaskMarker({ status }: { status: TaskStatus }) {
  const base = "flex size-4 shrink-0 items-center justify-center rounded-full";
  switch (status) {
    case "running":
      return (
        <span
          className={cn(
            base,
            "animate-spin border-2 border-gousse-line border-t-gousse-accent",
          )}
        />
      );
    case "done":
      return (
        <span className={cn(base, "bg-gousse-low text-gousse-panel")}>
          <Check size={10} strokeWidth={3} />
        </span>
      );
    case "failed":
      return (
        <span className={cn(base, "bg-gousse-high text-gousse-panel")}>
          <X size={10} strokeWidth={3} />
        </span>
      );
    case "skipped":
      return (
        <span className={cn(base, "border border-dashed border-gousse-muted/60")} />
      );
    default:
      return <Circle size={16} strokeWidth={1.5} className="shrink-0 text-gousse-line" />;
  }
}

const STATUS_TEXT: Record<TaskStatus, string> = {
  pending: "pending",
  running: "in progress",
  done: "done",
  failed: "failed",
  skipped: "skipped",
};

export function TaskItem({ task, className, ...props }: ComponentProps<"li"> & { task: Task }) {
  return (
    <li
      aria-current={task.status === "running" ? "step" : undefined}
      data-status={task.status}
      className={cn(
        "flex items-start gap-3 rounded-xl px-2 py-1.5 text-sm transition-colors",
        task.status === "running" && "bg-gousse-accent/[0.06]",
        className,
      )}
      {...props}
    >
      <span className="mt-0.5">
        <TaskMarker status={task.status} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block",
            task.status === "pending" && "text-gousse-muted",
            task.status === "running" && "font-medium text-gousse-ink",
            task.status === "done" && "text-gousse-muted line-through decoration-gousse-muted/40",
            task.status === "failed" && "text-gousse-high",
            task.status === "skipped" && "text-gousse-muted/70 line-through",
          )}
        >
          {task.label}
          <span className="sr-only"> — {STATUS_TEXT[task.status]}</span>
        </span>
        {task.detail ? (
          <span className="mt-0.5 block text-xs text-gousse-muted">{task.detail}</span>
        ) : null}
      </span>
    </li>
  );
}
