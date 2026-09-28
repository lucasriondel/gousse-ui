import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils.js";

/**
 * The app's styled button. cva variants replace the old plain variant record;
 * looks are ported verbatim from web's Button brick — shared chassis
 * (inline-flex, rounded-full, active:scale-[0.96] press, focus-visible accent
 * ring) plus per-variant color and per-variant disabled treatment (primary
 * greys its bg + not-allowed; the rest fade opacity). Local `className` still
 * merges last via cn().
 *
 * The chassis is a **pill**. gousse leans round: a control that could be
 * `rounded-md` or `rounded-full` takes the rounder option, and a pill sits
 * correctly inside any parent radius because it has no corner to disagree with.
 * The inset is `px-4` rather than the `px-3` a square button carried — a pill
 * eats its own horizontal padding at the ends, so rounding means widening.
 *
 * Two variant groups:
 * - `variant` — color. Defaults to `secondary`.
 * - `size`    — chassis geometry. Defaults to `default`, which is the historic
 *               `px-4 py-1.5` padding, so the scale is purely additive. `md`
 *               is the 40px hit-area floor, `sm` the compact toolbar row, and
 *               `icon` a square button whose hit area matches its height.
 *
 * The focus ring lives here rather than in each consumer: `active:scale` alone
 * left keyboard focus invisible, which is an a11y gap a primitive should own.
 */
const button = cva(
  "inline-flex items-center gap-2 rounded-full text-sm font-medium transition-[transform,colors] active:scale-[0.96] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-accent focus-visible:ring-offset-1 focus-visible:ring-offset-gousse-bg",
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
      size: {
        default: "px-4 py-1.5",
        md: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        /* justify-center only here: the other sizes shrink-to-fit, so centring
           them would silently re-align existing `w-full` call-sites. */
        icon: "size-9 justify-center px-0",
      },
    },
    defaultVariants: { variant: "secondary", size: "default" },
  },
);

interface Props
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  children: ReactNode;
}

export const Button = ({ variant, size, className, children, ...rest }: Props) => (
  <button {...rest} className={cn(button({ variant, size }), className)}>
    {children}
  </button>
);
