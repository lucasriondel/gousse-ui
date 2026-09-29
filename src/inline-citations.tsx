import { Fragment, type ComponentProps, type ReactNode } from "react";
import { PreviewCard } from "@base-ui-components/react/preview-card";
import { ArrowUpRight } from "lucide-react";
import { POPUP_ANIM, POPUP_SURFACE } from "./dropdown-menu.js";
import { cn } from "./utils.js";

/**
 * Prose with its sources attached — numbered markers in the text, a preview
 * of the source on hover or focus, and the full list of sources under it.
 *
 * {@link Citation} is the marker: a small numbered pill that is a real link to
 * the source, so it works with no JavaScript and middle-clicks into a tab.
 * Base UI's `PreviewCard` adds the hover/focus preview on top, positioned and
 * dismissed for you, in the same popup chrome as DropdownMenu.
 *
 * {@link CitedText} is the convenience: hand it `text` with `[n]` markers and
 * the `sources`, and it splits the text, places the markers and renders the
 * source list. Compose {@link Citation} and {@link SourceList} yourself when
 * the prose is richer than a string.
 */

export interface Source {
  /** The number the text refers to — `[1]`. */
  n: number;
  title: ReactNode;
  url: string;
  /** Short excerpt shown in the preview. */
  snippet?: ReactNode;
}

const hostOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const MARKER =
  "mx-0.5 inline-flex h-4 min-w-4 -translate-y-px items-center justify-center rounded-full bg-gousse-line/60 px-1 align-middle text-[10px] font-semibold tabular-nums text-gousse-muted no-underline transition-colors hover:bg-gousse-ink hover:text-gousse-bg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30 data-[popup-open]:bg-gousse-ink data-[popup-open]:text-gousse-bg";

export function Citation({ source, className }: { source: Source; className?: string }) {
  return (
    <PreviewCard.Root>
      <PreviewCard.Trigger
        href={source.url}
        target="_blank"
        rel="noreferrer"
        delay={150}
        aria-label={`Source ${source.n}: ${hostOf(source.url)}`}
        className={cn(MARKER, className)}
      >
        {source.n}
      </PreviewCard.Trigger>
      <PreviewCard.Portal>
        <PreviewCard.Positioner sideOffset={6} className="z-[70]">
          <PreviewCard.Popup
            className={cn(POPUP_SURFACE, POPUP_ANIM, "flex w-64 max-w-[min(16rem,calc(100vw-2rem))] flex-col gap-1 p-3 text-left")}
          >
            <span className="text-xs text-gousse-muted">{hostOf(source.url)}</span>
            <span className="text-sm font-semibold leading-snug text-gousse-ink">{source.title}</span>
            {source.snippet ? (
              <span className="line-clamp-3 text-xs leading-relaxed text-gousse-muted">
                {source.snippet}
              </span>
            ) : null}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}

/** The sources, as a list of links under a hairline. */
export function SourceList({
  sources,
  className,
  ...props
}: ComponentProps<"ol"> & { sources: readonly Source[] }) {
  return (
    <ol
      className={cn("flex flex-col gap-0.5 border-t border-gousse-line pt-2 text-left", className)}
      {...props}
    >
      {sources.map((s) => (
        <li key={s.n}>
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer"
            className="group/source -mx-2 flex items-center gap-2 rounded-full px-2 py-1 text-xs transition-colors hover:bg-gousse-line/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30"
          >
            <span className={cn(MARKER, "mx-0 translate-y-0")}>{s.n}</span>
            <span className="min-w-0 truncate font-medium text-gousse-ink">{s.title}</span>
            <span aria-hidden className="text-gousse-muted">·</span>
            <span className="shrink-0 text-gousse-muted transition-colors group-hover/source:text-gousse-ink">
              {hostOf(s.url)}
            </span>
            <ArrowUpRight
              size={12}
              aria-hidden
              className="ml-auto shrink-0 text-gousse-muted transition-transform duration-200 group-hover/source:-translate-y-px group-hover/source:translate-x-px"
            />
          </a>
        </li>
      ))}
    </ol>
  );
}

interface CitedTextProps extends ComponentProps<"div"> {
  /** Prose with `[n]` markers, e.g. `"Bun is fast [1][2]."`. */
  text: string;
  sources: readonly Source[];
  /** Render the source list under the text. */
  showSources?: boolean;
}

export function CitedText({
  text,
  sources,
  showSources = true,
  className,
  ...props
}: CitedTextProps) {
  const byN = new Map(sources.map((s) => [s.n, s]));
  const parts = text.split(/(\[\d+\])/g);
  const cited = sources.filter((s) => text.includes(`[${s.n}]`));

  return (
    <div className={cn("flex flex-col gap-3", className)} {...props}>
      <p className="text-sm leading-relaxed text-gousse-ink">
        {parts.map((part, i) => {
          const m = /^\[(\d+)\]$/.exec(part);
          const source = m ? byN.get(Number(m[1])) : undefined;
          return source ? <Citation key={i} source={source} /> : <Fragment key={i}>{part}</Fragment>;
        })}
      </p>
      {showSources && cited.length > 0 ? <SourceList sources={cited} /> : null}
    </div>
  );
}
