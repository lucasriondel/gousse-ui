import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils.js";

/**
 * Centered empty-state panel. Folds web's EmptyState (dashed border) and
 * AllCaughtUp (solid, softer border) onto one component via a `variant`:
 * - `dashed` (default) — the general "nothing here" state (was EmptyState)
 * - `solid`  — the celebratory all-caught-up state (was AllCaughtUp); the copy
 *              stays in the web wrapper.
 */
const empty = cva(
  "flex flex-col items-center justify-center rounded-xl border bg-gradient-to-b from-gousse-panel to-gousse-bg px-8 py-16 text-center shadow-gousse-sm",
  {
    variants: {
      variant: {
        dashed: "border-dashed border-gousse-line",
        solid: "border-gousse-line/40",
      },
    },
    defaultVariants: { variant: "dashed" },
  },
);

interface Props extends VariantProps<typeof empty> {
  title: string;
  description?: ReactNode;
  /** Rendered in flow above the title — typically a lucide icon. */
  icon?: ReactNode;
  action?: ReactNode;
  /** Alias for {@link Props.action}; `action` wins if both are given. */
  children?: ReactNode;
  className?: string;
}

export const Empty = ({
  title,
  description,
  icon,
  action,
  children,
  variant,
  className,
}: Props) => {
  // `children` is an alias so the common `<Empty>…<Link/></Empty>` shape works
  // without a wrapper; an explicit `action` takes precedence.
  const actionNode = action ?? children;

  return (
    <div className={cn(empty({ variant }), className)}>
      {icon ? (
        <div className="mb-4 flex items-center justify-center text-gousse-muted">{icon}</div>
      ) : null}
      <p className="text-lg font-bold text-gousse-ink">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm font-medium text-gousse-muted">{description}</p>
      ) : null}
      {actionNode ? <div className="mt-6">{actionNode}</div> : null}
    </div>
  );
};
