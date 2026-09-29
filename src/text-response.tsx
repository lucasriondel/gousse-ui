import type { ComponentProps, ReactNode } from "react";
import { cn } from "./utils.js";

/**
 * The prose an agent answers in. Not a bubble — an assistant turn reads best as
 * plain text on the page, the way a document does, with the user's turn being
 * the thing that gets a container. This sets the reading rhythm for whatever
 * markup lands inside: paragraph spacing, lists, inline `code`, links, bold,
 * headings, quotes — styled from the element selectors down, so rendered
 * Markdown (react-markdown, MDX, a sanitised HTML string) looks right without
 * per-element classes.
 *
 * `actions` puts a quiet row under the answer — copy, retry, thumbs — that
 * lifts to full ink on hover of the response, so it's there when you reach for
 * it and out of the way when you're reading.
 */

interface TextResponseProps extends ComponentProps<"div"> {
  /** A row under the answer — CopyButton, retry, feedback. */
  actions?: ReactNode;
}

const PROSE = [
  "text-sm leading-relaxed text-gousse-ink",
  "[&_p]:mb-2.5 [&_p:last-child]:mb-0",
  "[&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h1:first-child]:mt-0",
  "[&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h2:first-child]:mt-0",
  "[&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:font-semibold",
  "[&_ul]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2.5 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:mb-1 [&_li]:marker:text-gousse-muted",
  "[&_strong]:font-semibold",
  "[&_a]:font-medium [&_a]:underline [&_a]:decoration-gousse-line [&_a]:underline-offset-2 hover:[&_a]:decoration-gousse-ink",
  "[&_blockquote]:mb-2.5 [&_blockquote]:border-l-2 [&_blockquote]:border-gousse-line [&_blockquote]:pl-3 [&_blockquote]:text-gousse-muted",
  "[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-gousse-line/50 [&_:not(pre)>code]:px-1 [&_:not(pre)>code]:py-px [&_:not(pre)>code]:font-mono [&_:not(pre)>code]:text-[0.9em]",
  "[&_hr]:my-4 [&_hr]:border-gousse-line",
].join(" ");

export function TextResponse({ actions, className, children, ...props }: TextResponseProps) {
  return (
    <div className={cn("group/response flex flex-col gap-2 text-left", className)} {...props}>
      <div className={PROSE}>{children}</div>
      {actions ? (
        <div className="-ml-1.5 flex items-center gap-0.5 opacity-60 transition-opacity group-hover/response:opacity-100 focus-within:opacity-100">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

/**
 * An icon button for the action row — same chassis as CopyButton, so a row of
 * them reads as one set.
 */
export function ResponseAction({
  label,
  active = false,
  className,
  children,
  ...props
}: ComponentProps<"button"> & { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full text-gousse-muted transition-[transform,colors] hover:bg-gousse-line/60 hover:text-gousse-ink active:scale-[0.92] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30",
        active && "text-gousse-ink",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
