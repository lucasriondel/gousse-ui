import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils.js";

/**
 * The app's styled button. cva variants replace the old plain variant record;
 * looks are ported verbatim from web's Button brick — shared chassis
 * (inline-flex, rounded-md, active:scale-[0.96] press) plus per-variant color
 * and per-variant disabled treatment (primary greys its bg + not-allowed;
 * the rest fade opacity). Local `className` still merges last via cn().
 */
const button = cva(
  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-[transform,colors] active:scale-[0.96]",
  {
    variants: {
      variant: {
        primary:
          "bg-gousse-ink text-gousse-bg hover:bg-gousse-ink/90 disabled:bg-gousse-muted disabled:cursor-not-allowed",
        secondary:
          "bg-gousse-panel border border-gousse-line text-gousse-ink hover:bg-gousse-bg disabled:opacity-50 disabled:cursor-not-allowed",
        ghost:
          "bg-transparent text-gousse-ink hover:bg-gousse-line/60 disabled:opacity-50 disabled:cursor-not-allowed",
        danger:
          "bg-gousse-high text-white hover:bg-gousse-high/85 disabled:opacity-50 disabled:cursor-not-allowed",
      },
    },
    defaultVariants: { variant: "secondary" },
  },
);

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  children: ReactNode;
}

export const Button = ({ variant, className, children, ...rest }: Props) => (
  <button {...rest} className={cn(button({ variant }), className)}>
    {children}
  </button>
);
