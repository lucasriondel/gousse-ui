import type { ComponentProps, ReactNode } from "react";
import { CopyButton } from "./copy-button.js";
import { cn } from "./utils.js";

/**
 * A fenced code block as an agent emits it — a header naming the language (or
 * file) with a copy button, over a scrolling monospaced body with optional line
 * numbers.
 *
 * No highlighter ships with it. Syntax colouring is a large, opinionated
 * dependency (Shiki, Prism, highlight.js all bring their own themes), so the
 * block renders `code` as plain ink by default and takes pre-highlighted
 * markup through `children` when you have it. The copy button always copies
 * `code`, the raw text, whichever you render.
 *
 * A surface, so `rounded-2xl`. The body sits on the page colour inside the
 * panel-coloured header, which reads as a well rather than a second card.
 */

interface CodeBlockProps extends Omit<ComponentProps<"figure">, "children"> {
  /** The raw source. Always what gets copied. */
  code: string;
  /** Shown in the header — `"tsx"`, `"bash"`, `"src/app.ts"`. */
  language?: ReactNode;
  /** Number each line in a gutter. */
  lineNumbers?: boolean;
  /** 1-based line numbers to tint as emphasised. */
  highlightLines?: readonly number[];
  /** Pre-highlighted markup to render instead of plain `code`. */
  children?: ReactNode;
  /** Extra header controls, rendered before the copy button. */
  actions?: ReactNode;
  /** Cap the body height; it scrolls past it. */
  maxHeight?: number | string;
}

export function CodeBlock({
  code,
  language,
  lineNumbers = false,
  highlightLines,
  children,
  actions,
  maxHeight,
  className,
  ...props
}: CodeBlockProps) {
  const lines = code.replace(/\n$/, "").split("\n");
  const emphasised = new Set(highlightLines);
  const perLine = lineNumbers || emphasised.size > 0;

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-2xl border border-gousse-line bg-gousse-panel text-left",
        className,
      )}
      {...props}
    >
      <figcaption className="flex items-center justify-between gap-2 border-b border-gousse-line py-1 pl-4 pr-1.5">
        <span className="truncate font-mono text-xs text-gousse-muted">{language ?? "code"}</span>
        <span className="flex items-center gap-0.5">
          {actions}
          <CopyButton value={code} />
        </span>
      </figcaption>
      <pre
        className="overflow-auto bg-gousse-bg py-3 font-mono text-[13px] leading-6 text-gousse-ink"
        style={{ maxHeight }}
      >
        {children !== undefined ? (
          <code className="block px-4">{children}</code>
        ) : perLine ? (
          <code className="grid min-w-max">
            {lines.map((line, i) => (
              <span
                key={i}
                className={cn(
                  "flex pr-4",
                  emphasised.has(i + 1)
                    ? "bg-gousse-accent/10 shadow-[inset_2px_0_0] shadow-gousse-accent"
                    : undefined,
                )}
              >
                {lineNumbers ? (
                  <span
                    aria-hidden
                    className="w-10 shrink-0 select-none pr-3 text-right tabular-nums text-gousse-muted/60"
                  >
                    {i + 1}
                  </span>
                ) : (
                  <span className="w-4 shrink-0" />
                )}
                <span>{line || " "}</span>
              </span>
            ))}
          </code>
        ) : (
          <code className="block min-w-max px-4">{code}</code>
        )}
      </pre>
    </figure>
  );
}
