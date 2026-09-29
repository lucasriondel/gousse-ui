import type { ComponentProps, ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "./utils.js";

/**
 * A feature matrix — options across the top, features down the side, a check
 * or a dash where they meet. The shape an agent reaches for when asked "which
 * should I pick?".
 *
 * A cell is `true` (included — a `low`-hued check), `false` (not — a muted
 * dash) or any node for the in-between answers ("5 GB", "Beta"). Each carries
 * screen-reader text, so the grid reads as "included"/"not included" rather
 * than as a column of unlabeled icons.
 *
 * `highlight` names one option to recommend: its column takes an accent wash
 * top to bottom and a badge in the header.
 */

export interface ComparisonOption {
  key: string;
  label: ReactNode;
  /** A line under the label — a price, a tagline. */
  sub?: ReactNode;
}

export interface ComparisonFeature {
  label: ReactNode;
  /** One value per option, keyed by option `key`. */
  values: Record<string, boolean | ReactNode>;
}

interface ComparisonTableProps extends Omit<ComponentProps<"div">, "children"> {
  options: readonly ComparisonOption[];
  features: readonly ComparisonFeature[];
  /** Option key to recommend. */
  highlight?: string;
  highlightLabel?: ReactNode;
  caption?: ReactNode;
}

function Value({ value }: { value: boolean | ReactNode }) {
  if (value === true)
    return (
      <>
        <Check size={15} strokeWidth={2.5} aria-hidden className="mx-auto text-gousse-low" />
        <span className="sr-only">Included</span>
      </>
    );
  if (value === false || value === undefined || value === null)
    return (
      <>
        <Minus size={15} aria-hidden className="mx-auto text-gousse-muted/50" />
        <span className="sr-only">Not included</span>
      </>
    );
  return <span className="text-gousse-ink">{value}</span>;
}

export function ComparisonTable({
  options,
  features,
  highlight,
  highlightLabel = "Recommended",
  caption,
  className,
  ...props
}: ComparisonTableProps) {
  const hl = (key: string) => key === highlight && "bg-gousse-accent/[0.07]";

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-gousse-line bg-gousse-panel shadow-gousse-sm",
        className,
      )}
      {...props}
    >
      <table className="w-full border-collapse text-[13px]">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-gousse-line">
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gousse-muted">
              {caption ? <span aria-hidden>{caption}</span> : null}
            </th>
            {options.map((o) => (
              <th
                key={o.key}
                scope="col"
                className={cn("min-w-28 px-4 py-3 text-center align-bottom", hl(o.key))}
              >
                {o.key === highlight ? (
                  <span className="mb-1.5 inline-block rounded-full bg-gousse-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gousse-accent">
                    {highlightLabel}
                  </span>
                ) : null}
                <span className="block text-sm font-semibold text-gousse-ink">{o.label}</span>
                {o.sub ? (
                  <span className="block text-xs font-normal text-gousse-muted">{o.sub}</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {features.map((f, i) => (
            <tr key={i} className="border-b border-gousse-line/60 last:border-0">
              <th scope="row" className="px-4 py-2.5 text-left font-normal text-gousse-ink">
                {f.label}
              </th>
              {options.map((o) => (
                <td key={o.key} className={cn("px-4 py-2.5 text-center", hl(o.key))}>
                  <Value value={f.values[o.key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
