import { useMemo, useState, type ComponentProps, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "./utils.js";

/**
 * A compact table for the structured answer an agent returns — models and
 * their prices, files and their sizes, anything with rows and columns. Rounded
 * card, hairline row rules, and cells that ellipsise instead of wrapping so
 * the table keeps its shape at chat width (it scrolls sideways past that).
 *
 * Columns are declared, rows are plain objects. A column with `sortable`
 * sorts on header click — ascending, descending, back to the given order —
 * with `aria-sort` on the header so the state is announced. Numeric columns
 * (`align: "right"`) get tabular figures so digits line up.
 *
 * `empty` renders in place of the body when there are no rows; `loading`
 * shows skeleton rows in the columns' shape.
 */

export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  /** Cell content; defaults to `row[key]`. */
  cell?: (row: Row) => ReactNode;
  /** Sort value; defaults to `row[key]`. Presence makes the column sortable. */
  sortValue?: (row: Row) => string | number;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  /** CSS width, e.g. `"40%"` or `120`. */
  width?: string | number;
}

interface DataTableProps<Row> extends Omit<ComponentProps<"div">, "children"> {
  columns: readonly DataTableColumn<Row>[];
  rows: readonly Row[];
  rowKey?: (row: Row, index: number) => string | number;
  caption?: ReactNode;
  empty?: ReactNode;
  loading?: boolean;
}

type Sort = { key: string; dir: "asc" | "desc" } | null;

const ALIGN = { left: "text-left", right: "text-right tabular-nums", center: "text-center" };

export function DataTable<Row extends object>({
  columns,
  rows,
  rowKey = (_, i) => i,
  caption,
  empty = "No rows",
  loading = false,
  className,
  ...props
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<Sort>(null);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const value = col.sortValue ?? ((r: Row) => (r as Record<string, unknown>)[col.key] as string | number);
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [rows, columns, sort]);

  const cycle = (key: string) =>
    setSort((s) =>
      s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null,
    );

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-gousse-line bg-gousse-panel shadow-gousse-sm",
        className,
      )}
      {...props}
    >
      <table className="w-full border-collapse text-[13px]">
        {caption ? (
          <caption className="border-b border-gousse-line px-4 py-2.5 text-left text-sm font-semibold text-gousse-ink">
            {caption}
          </caption>
        ) : null}
        <thead>
          <tr className="border-b border-gousse-line">
            {columns.map((col) => {
              const sortable = col.sortable || col.sortValue !== undefined;
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                  style={{ width: col.width }}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 text-xs font-medium text-gousse-muted",
                    ALIGN[col.align ?? "left"],
                  )}
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => cycle(col.key)}
                      className={cn(
                        "-mx-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 transition-colors hover:bg-gousse-line/40 hover:text-gousse-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30",
                        active && "text-gousse-ink",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {col.header}
                      {active ? (
                        sort.dir === "asc" ? (
                          <ArrowUp size={12} aria-hidden />
                        ) : (
                          <ArrowDown size={12} aria-hidden />
                        )
                      ) : (
                        <ChevronsUpDown size={12} aria-hidden className="opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 3 }, (_, i) => (
              <tr key={i} className="border-b border-gousse-line/60 last:border-0">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5">
                    <span className="block h-3 animate-pulse rounded-full bg-gousse-line/70" />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-6 text-center text-gousse-muted">
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                className="border-b border-gousse-line/60 transition-colors last:border-0 hover:bg-gousse-bg"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "max-w-64 truncate px-4 py-2 text-gousse-ink",
                      ALIGN[col.align ?? "left"],
                    )}
                  >
                    {col.cell ? col.cell(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
