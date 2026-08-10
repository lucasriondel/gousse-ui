import type { ComponentProps } from "react";
import { FIELD_CHROME } from "./field-chrome.js";
import { cn } from "./utils.js";

/**
 * Text input with the app's standard field chrome ({@link FIELD_CHROME}),
 * folding the recurring `focus:border-gousse-ink focus:outline-hidden` focus
 * treatment shared by the reply/compose fields. `className` extends or
 * overrides via cn().
 *
 * NOTE: fields with genuinely different chrome (ModelPicker's no-focus mono
 * input, SyncRangeControls' tighter date inputs) stay raw <input> — routing
 * them here would add a focus ring / change padding, which the behavior
 * contract forbids.
 */
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(FIELD_CHROME, className)} {...props} />;
}
