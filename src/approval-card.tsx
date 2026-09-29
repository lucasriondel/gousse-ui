import { useState, type ComponentProps, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, MessageCircleQuestion, ShieldAlert, Wrench, X } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./utils.js";

/**
 * The card an agent stops on when it needs a yes before acting — "Run `rm -rf
 * dist`?", "Send this email?", "Charge $40?". It names the tool, shows what it
 * is about to do, and offers Approve / Deny; once answered it collapses to a
 * one-line receipt of the decision.
 *
 * `risk` sets how loud the ask is. `default` is a plain panel; `caution` washes
 * the header in the accent and `danger` in the `high` hue and turns the approve
 * button destructive — the colour should rise with what a wrong "yes" costs.
 *
 * `status` is controlled by the caller: the card never decides for itself that
 * an action happened. `pending` shows the buttons, `approved`/`denied` show the
 * receipt, and `running` holds the approved look with the buttons gone while
 * the tool executes.
 *
 * The body is whatever the ask needs: {@link ApprovalCommand} for a shell
 * command, {@link ApprovalPlan} for a short plan, or any node. When the agent
 * needs an answer rather than a yes, {@link QuestionCard} is the sibling that
 * asks up to three multiple-choice questions.
 */

export type ApprovalStatus = "pending" | "running" | "approved" | "denied";

const header = cva("flex items-center gap-2.5 px-4 py-3", {
  variants: {
    risk: {
      default: "",
      caution: "bg-gousse-accent/10",
      danger: "bg-gousse-high/10",
    },
  },
  defaultVariants: { risk: "default" },
});

const glyphTone = {
  default: "bg-gousse-line/60 text-gousse-ink",
  caution: "bg-gousse-accent/15 text-gousse-accent",
  danger: "bg-gousse-high/15 text-gousse-high",
} as const;

interface ApprovalCardProps
  extends Omit<ComponentProps<"section">, "title">, VariantProps<typeof header> {
  /** What the agent wants to do — "Run a shell command". */
  title: ReactNode;
  /** The tool name, shown monospaced in the header. */
  tool?: ReactNode;
  /** One line of why — "Needed to clear the stale build". */
  description?: ReactNode;
  status?: ApprovalStatus;
  onApprove?: () => void;
  onDeny?: () => void;
  approveLabel?: ReactNode;
  denyLabel?: ReactNode;
  /** Replaces the tool glyph. */
  icon?: ReactNode;
  /** The payload — a CodeBlock, a diff, a field list. Hidden once answered. */
  children?: ReactNode;
}

export function ApprovalCard({
  title,
  tool,
  description,
  risk = "default",
  status = "pending",
  onApprove,
  onDeny,
  approveLabel = "Approve",
  denyLabel = "Deny",
  icon,
  className,
  children,
  ...props
}: ApprovalCardProps) {
  const tone = risk ?? "default";
  const answered = status === "approved" || status === "denied";
  const Glyph = tone === "default" ? Wrench : ShieldAlert;

  if (answered) {
    const approved = status === "approved";
    return (
      <section
        data-status={status}
        className={cn(
          "flex items-center gap-2.5 rounded-full border border-gousse-line bg-gousse-panel py-1.5 pl-2 pr-4 text-sm",
          className,
        )}
        {...props}
      >
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full",
            approved ? "bg-gousse-low/15 text-gousse-low" : "bg-gousse-high/15 text-gousse-high",
          )}
        >
          {approved ? <Check size={13} strokeWidth={2.5} /> : <X size={13} strokeWidth={2.5} />}
        </span>
        <span className="min-w-0 flex-1 truncate text-gousse-ink">{title}</span>
        <span
          className={cn("text-xs font-semibold", approved ? "text-gousse-low" : "text-gousse-high")}
        >
          {approved ? "Approved" : "Denied"}
        </span>
      </section>
    );
  }

  return (
    <section
      role="group"
      aria-label="Approval required"
      data-status={status}
      data-risk={tone}
      className={cn(
        "animate-slide-up overflow-hidden rounded-2xl border bg-gousse-panel text-left shadow-gousse-md",
        tone === "danger"
          ? "border-gousse-high/30"
          : tone === "caution"
            ? "border-gousse-accent/30"
            : "border-gousse-line",
        className,
      )}
      {...props}
    >
      <header className={header({ risk })}>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full",
            glyphTone[tone],
          )}
        >
          {icon ?? <Glyph size={15} aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gousse-ink">{title}</h3>
          {tool ? <p className="truncate font-mono text-xs text-gousse-muted">{tool}</p> : null}
        </div>
      </header>
      {description || children ? (
        <div className="flex flex-col gap-3 px-4 pt-3 text-sm text-gousse-muted">
          {description ? <p className="leading-relaxed">{description}</p> : null}
          {children}
        </div>
      ) : null}
      <footer className="flex items-center justify-end gap-2 px-4 py-3">
        {status === "running" ? (
          <span className="inline-flex items-center gap-2 text-xs font-medium text-gousse-muted">
            <span className="size-3 animate-spin rounded-full border-2 border-gousse-line border-t-gousse-accent" />
            Running…
          </span>
        ) : (
          <>
            <Button variant="ghost" onClick={onDeny}>
              {denyLabel}
            </Button>
            <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onApprove}>
              {approveLabel}
            </Button>
          </>
        )}
      </footer>
    </section>
  );
}

/**
 * The payload for a shell-command approval — the command in a monospaced well
 * with a `$` prompt, wrapped rather than scrolled so nothing it does is hidden
 * off the right edge.
 */
export function ApprovalCommand({
  command,
  cwd,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & { command: string; cwd?: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-gousse-line bg-gousse-bg px-3 py-2 font-mono text-[12.5px] leading-5",
        className,
      )}
      {...props}
    >
      {cwd ? <div className="mb-0.5 text-[11px] text-gousse-muted">{cwd}</div> : null}
      <div className="flex gap-2 text-gousse-ink">
        <span aria-hidden className="select-none text-gousse-muted">
          $
        </span>
        <code className="whitespace-pre-wrap break-all">{command}</code>
      </div>
    </div>
  );
}

/**
 * The payload for a plan approval — the numbered steps the agent intends to
 * take, so "yes" is a yes to something specific.
 */
export function ApprovalPlan({
  steps,
  className,
  ...props
}: Omit<ComponentProps<"ol">, "children"> & { steps: readonly ReactNode[] }) {
  return (
    <ol className={cn("flex flex-col gap-1.5", className)} {...props}>
      {steps.map((step, i) => (
        <li key={i} className="flex gap-2.5 text-gousse-ink">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gousse-line/60 text-[11px] font-semibold tabular-nums text-gousse-muted">
            {i + 1}
          </span>
          <span className="pt-px leading-snug">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------- questions */

export interface ClarifyQuestion {
  id: string;
  question: ReactNode;
  options: readonly string[];
}

interface QuestionCardProps extends Omit<ComponentProps<"section">, "onSubmit" | "title"> {
  /** Up to three questions — more than that and it's a form, not a pause. */
  questions: readonly ClarifyQuestion[];
  title?: ReactNode;
  /** Called with `{ [question id]: chosen option }`. */
  onSubmit?: (answers: Record<string, string>) => void;
  onSkip?: () => void;
  submitLabel?: ReactNode;
}

/**
 * The other way an agent pauses: not "may I?" but "which do you mean?". One to
 * three short questions, each with a row of answer pills; Continue unlocks once
 * every question has an answer. Each row is a native radio group, so arrows
 * move within a row and Tab moves between them.
 */
export function QuestionCard({
  questions,
  title = "A few questions before I start",
  onSubmit,
  onSkip,
  submitLabel = "Continue",
  className,
  ...props
}: QuestionCardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const shown = questions.slice(0, 3);
  const complete = shown.every((q) => answers[q.id] !== undefined);

  return (
    <section
      role="group"
      aria-label="Clarifying questions"
      className={cn(
        "animate-slide-up overflow-hidden rounded-2xl border border-gousse-line bg-gousse-panel text-left shadow-gousse-md",
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-2.5 px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gousse-line/60 text-gousse-ink">
          <MessageCircleQuestion size={15} aria-hidden />
        </span>
        <h3 className="text-sm font-semibold text-gousse-ink">{title}</h3>
      </header>
      <div className="flex flex-col gap-4 px-4 pt-1">
        {shown.map((q, qi) => (
          <fieldset key={q.id} className="flex flex-col">
            <legend className="mb-2 text-sm text-gousse-ink">
              <span className="mr-1.5 tabular-nums text-gousse-muted">{qi + 1}.</span>
              {q.question}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {q.options.map((opt) => {
                const checked = answers[q.id] === opt;
                return (
                  <label
                    key={opt}
                    className={cn(
                      "cursor-pointer rounded-full border px-3.5 py-1 text-xs font-medium transition-[transform,colors] active:scale-[0.96] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-gousse-ink/30",
                      checked
                        ? "border-gousse-ink bg-gousse-ink text-gousse-bg"
                        : "border-gousse-line text-gousse-ink hover:bg-gousse-line/40",
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={checked}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                      className="sr-only"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <footer className="flex items-center justify-end gap-2 px-4 py-3">
        {onSkip ? (
          <Button variant="ghost" onClick={onSkip}>
            Skip
          </Button>
        ) : null}
        <Button variant="primary" disabled={!complete} onClick={() => onSubmit?.(answers)}>
          {submitLabel}
        </Button>
      </footer>
    </section>
  );
}
