import type { ComponentProps } from "react";
import { FIELD_CHROME } from "./field-chrome";
import { cn } from "./utils";

/**
 * Multi-line text field sharing {@link Input}'s chrome via {@link FIELD_CHROME}
 * (border, bg, the folded `focus:border-gousse-ink focus:outline-none`).
 * `className` extends or overrides via cn() — e.g. FilterSimilarPopover passes
 * `resize-none`, a `bg-gousse-bg` override, placeholder + disabled treatment.
 */
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(FIELD_CHROME, className)} {...props} />;
}
