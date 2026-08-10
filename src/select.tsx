import type { ComponentProps } from "react";
import { cn } from "./utils.js";

/**
 * Thin styled wrapper over a native <select> — keeps OS picker semantics and
 * passes <option> children straight through, so consumers keep their own
 * option logic (the `__custom__` sentinel, out-of-preset extra options).
 * Only the field chrome is standardized; zero behavior change. `className`
 * extends/overrides via cn().
 */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "rounded border border-gousse-line bg-gousse-panel px-2 py-1.5 text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
