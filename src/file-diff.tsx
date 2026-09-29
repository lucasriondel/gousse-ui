import { useState, type ComponentProps, type ReactNode } from "react";
import { Check, ChevronRight, FileCode2, X } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./utils.js";

/**
 * The change an agent proposes to a file, as an inline diff card: the path
 * with +N / −N counts, then one row per line — old and new line numbers, a
 * sign, the text. Added lines take the `low` (good) wash, removed ones the
 * `high` wash, context stays on the panel.
 *
 * The removed rows' edge bar is hatched rather than solid, so added and
 * removed read apart without relying on the red/green pair alone.
 *
 * Optional review footer: pass `onAccept`/`onReject` and the card asks for a
 * decision; pass `status` to show the answer. The body folds from the header
 * chevron (uncontrolled, open by default), for a long diff in a long thread.
 *
 * Rows are data, not a unified-diff string — the caller parses. {@link parseUnifiedDiff}
 * handles the common `+`/`-`/space form if you have raw patch text.
 */

export type DiffRowType = "add" | "del" | "ctx";

export interface DiffRow {
  type: DiffRowType;
  text: string;
  oldLine?: number;
  newLine?: number;
}

export type DiffReviewStatus = "pending" | "accepted" | "rejected";

interface FileDiffProps extends Omit<ComponentProps<"figure">, "children"> {
  file: ReactNode;
  rows: readonly DiffRow[];
  status?: DiffReviewStatus;
  onAccept?: () => void;
  onReject?: () => void;
  defaultOpen?: boolean;
}

/** Parse the hunk body of a unified diff (`+`, `-`, ` ` prefixed lines). */
export function parseUnifiedDiff(patch: string, startOld = 1, startNew = 1): DiffRow[] {
  let o = startOld;
  let n = startNew;
  const rows: DiffRow[] = [];
  for (const line of patch.replace(/\n$/, "").split("\n")) {
    if (line.startsWith("+")) rows.push({ type: "add", text: line.slice(1), newLine: n++ });
    else if (line.startsWith("-")) rows.push({ type: "del", text: line.slice(1), oldLine: o++ });
    else rows.push({ type: "ctx", text: line.replace(/^ /, ""), oldLine: o++, newLine: n++ });
  }
  return rows;
}

const ROW: Record<DiffRowType, string> = {
  add: "bg-gousse-low/10",
  del: "bg-gousse-high/10",
  ctx: "",
};

const SIGN: Record<DiffRowType, string> = { add: "+", del: "−", ctx: " " };

export function FileDiff({
  file,
  rows,
  status,
  onAccept,
  onReject,
  defaultOpen = true,
  className,
  ...props
}: FileDiffProps) {
  const [open, setOpen] = useState(defaultOpen);
  const added = rows.filter((r) => r.type === "add").length;
  const removed = rows.filter((r) => r.type === "del").length;
  const reviewing = status === "pending" || (!status && (onAccept || onReject));

  return (
    <figure
      data-status={status}
      className={cn(
        "overflow-hidden rounded-2xl border border-gousse-line bg-gousse-panel text-left",
        className,
      )}
      {...props}
    >
      <figcaption className="flex items-center gap-2 py-1.5 pl-2 pr-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-2 py-1 text-left transition-colors hover:bg-gousse-line/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30"
        >
          <ChevronRight
            size={14}
            aria-hidden
            className={cn("shrink-0 text-gousse-muted transition-transform duration-200", open && "rotate-90")}
          />
          <FileCode2 size={14} aria-hidden className="shrink-0 text-gousse-muted" />
          <span className="truncate font-mono text-xs text-gousse-ink">{file}</span>
        </button>
        <span className="flex shrink-0 gap-1.5 font-mono text-xs font-semibold tabular-nums">
          <span className="text-gousse-low">+{added}</span>
          <span className="text-gousse-high">−{removed}</span>
        </span>
        {status === "accepted" || status === "rejected" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold",
              status === "accepted" ? "text-gousse-low" : "text-gousse-high",
            )}
          >
            {status === "accepted" ? <Check size={12} /> : <X size={12} />}
            {status === "accepted" ? "Accepted" : "Rejected"}
          </span>
        ) : null}
      </figcaption>
      {open ? (
        <div className="overflow-x-auto border-t border-gousse-line [scrollbar-width:none]">
          <table className="w-full min-w-max border-collapse font-mono text-[12.5px] leading-6">
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} data-type={row.type} className={ROW[row.type]}>
                  <td
                    aria-hidden
                    className={cn(
                      "w-[3px] p-0",
                      row.type === "add" && "bg-gousse-low",
                      row.type === "del" &&
                        "bg-[repeating-linear-gradient(135deg,var(--color-gousse-high)_0_2px,transparent_2px_4px)]",
                    )}
                  />
                  <td className="w-10 select-none pr-2 text-right tabular-nums text-gousse-muted/60">
                    {row.oldLine ?? ""}
                  </td>
                  <td className="w-10 select-none pr-2 text-right tabular-nums text-gousse-muted/60">
                    {row.newLine ?? ""}
                  </td>
                  <td
                    className={cn(
                      "w-5 select-none text-center",
                      row.type === "add" && "text-gousse-low",
                      row.type === "del" && "text-gousse-high",
                    )}
                  >
                    <span className="sr-only">
                      {row.type === "add" ? "added" : row.type === "del" ? "removed" : ""}
                    </span>
                    <span aria-hidden>{SIGN[row.type]}</span>
                  </td>
                  <td className="whitespace-pre pr-4 text-gousse-ink">{row.text || " "}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {reviewing ? (
        <footer className="flex justify-end gap-2 border-t border-gousse-line px-4 py-2.5">
          <Button variant="ghost" onClick={onReject}>
            Reject
          </Button>
          <Button variant="primary" onClick={onAccept}>
            Accept
          </Button>
        </footer>
      ) : null}
    </figure>
  );
}
