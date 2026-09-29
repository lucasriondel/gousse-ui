import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "./utils.js";

/**
 * Text that arrives while you watch — the answer as a model streams it. Each
 * new chunk fades up out of a soft blur (`.gousse-stream-chunk`) and a block
 * caret (`.gousse-caret`) rides the tail until `streaming` goes false.
 *
 * The component does not fetch or tokenise anything: the caller owns the
 * stream and passes the text accumulated so far as `text`. Chunk boundaries
 * are simply whatever was appended since the last render, so a token stream, a
 * word stream and a line stream all animate at their own grain.
 *
 * `aria-live="polite"` is off while streaming and on once it settles — a
 * screen reader announcing every token is noise; announcing the finished
 * answer once is the useful part. Both classes come from `agent-motion.css`.
 */

interface StreamingTextProps extends Omit<ComponentProps<"div">, "children"> {
  /** Everything received so far. Grow it; don't rewrite its head. */
  text: string;
  /** Shows the caret and keeps the region quiet to assistive tech. */
  streaming?: boolean;
}

export function StreamingText({
  text,
  streaming = false,
  className,
  ...props
}: StreamingTextProps) {
  // Split the text into the chunks it arrived in. A chunk boundary is recorded
  // each time `text` grows; a rewrite that doesn't extend the old head resets.
  const [bounds, setBounds] = useState<number[]>(() => (text ? [text.length] : []));
  const prev = useRef(text);

  useEffect(() => {
    const before = prev.current;
    prev.current = text;
    if (text === before) return;
    if (text.startsWith(before)) setBounds((b) => [...b, text.length]);
    else setBounds(text ? [text.length] : []);
  }, [text]);

  // The last recorded bound can lag one render behind `text`; treat the
  // unrecorded tail as its own (newest) chunk so nothing is dropped.
  const ends = bounds.at(-1) === text.length ? bounds : [...bounds, text.length];
  const chunks = ends.map((end, i) => text.slice(i === 0 ? 0 : ends[i - 1], end));

  return (
    <div
      aria-live={streaming ? "off" : "polite"}
      aria-busy={streaming || undefined}
      className={cn(
        "whitespace-pre-wrap text-sm leading-relaxed text-gousse-ink",
        className,
      )}
      {...props}
    >
      {chunks.map((chunk, i) => (
        <span key={i} className={streaming ? "gousse-stream-chunk" : undefined}>
          {chunk}
        </span>
      ))}
      {streaming ? <span aria-hidden className="gousse-caret" /> : null}
    </div>
  );
}

/**
 * Story/demo helper: reveals `source` a few characters at a time, as a model
 * would. Returns the accumulated text and whether it is still going.
 */
export function useSimulatedStream(
  source: string,
  { chunk = 3, interval = 40, run = true }: { chunk?: number; interval?: number; run?: boolean } = {},
): { text: string; streaming: boolean; restart: () => void } {
  const [length, setLength] = useState(0);
  useEffect(() => {
    if (!run || length >= source.length) return;
    const id = setTimeout(
      () => setLength((n) => Math.min(source.length, n + chunk + Math.floor(Math.random() * chunk))),
      interval,
    );
    return () => clearTimeout(id);
  }, [run, length, source, chunk, interval]);
  return {
    text: source.slice(0, length),
    streaming: length < source.length,
    restart: () => setLength(0),
  };
}
