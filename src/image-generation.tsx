import { useState, type ComponentProps, type ReactNode } from "react";
import { ImageIcon, TriangleAlert } from "lucide-react";
import { cn } from "./utils.js";

/**
 * The canvas an image lands on while a model draws it. Generating, it is a
 * soft panel at the requested aspect ratio with a scan band sweeping down
 * (`.gousse-scan` in `agent-motion.css`) and a shimmering caption — "Creating
 * image" and, if given, a progress percentage. Done, the image resolves out
 * of a blur onto the same frame, so the thread doesn't jump when it arrives.
 * Failed, the frame stays and says so.
 *
 * `aspect` keeps the frame's box stable across all three states: the space is
 * reserved before a single pixel exists.
 */

export type ImageGenerationStatus = "generating" | "done" | "error";

const ASPECT = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[16/9]",
} as const;

export type ImageAspect = keyof typeof ASPECT;

interface ImageGenerationProps extends Omit<ComponentProps<"figure">, "children"> {
  status?: ImageGenerationStatus;
  aspect?: ImageAspect;
  /** The finished image. */
  src?: string;
  alt?: string;
  /** 0–100; shown in the caption while generating. */
  progress?: number;
  /** Caption while generating. */
  label?: ReactNode;
  /** Message on failure. */
  error?: ReactNode;
  /** Caption under the frame once done (the prompt, say). */
  caption?: ReactNode;
}

export function ImageGeneration({
  status = "generating",
  aspect = "square",
  src,
  alt = "",
  progress,
  label = "Creating image",
  error = "Couldn't create this image",
  caption,
  className,
  ...props
}: ImageGenerationProps) {
  // Keyed by `src`, so a new image (or a regenerate) starts un-revealed.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc !== null && loadedSrc === src;
  const generating = status === "generating";

  return (
    <figure className={cn("flex w-full max-w-sm flex-col gap-2 text-left", className)} {...props}>
      <div
        aria-busy={generating || undefined}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-gousse-line bg-gousse-bg",
          ASPECT[aspect],
        )}
      >
        {generating ? (
          <>
            <div aria-hidden className="absolute inset-0 animate-pulse">
              <span className="absolute left-[10%] top-[12%] size-1/2 rounded-full bg-gousse-accent/15 blur-2xl" />
              <span className="absolute bottom-[10%] right-[8%] size-3/5 rounded-full bg-gousse-line blur-2xl" />
            </div>
            <div className="gousse-scan" aria-hidden />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <ImageIcon size={20} aria-hidden className="text-gousse-muted" />
              <span role="status" className="flex items-center gap-1.5 text-sm font-medium">
                <span className="gousse-shimmer">{label}</span>
                {progress !== undefined ? (
                  <span className="tabular-nums text-xs text-gousse-muted">
                    {Math.round(progress)}%
                  </span>
                ) : null}
              </span>
            </div>
            {progress !== undefined ? (
              <div className="absolute inset-x-4 bottom-4 h-1 overflow-hidden rounded-full bg-gousse-line/60">
                <div
                  className="h-full rounded-full bg-gousse-ink/70 transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            ) : null}
          </>
        ) : status === "error" ? (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gousse-high/5 px-6 text-center text-sm font-medium text-gousse-high"
          >
            <TriangleAlert size={18} aria-hidden />
            {error}
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={() => setLoadedSrc(src ?? null)}
            // A cached image can finish before React attaches onLoad.
            ref={(el) => {
              if (el?.complete && el.naturalWidth > 0) setLoadedSrc(src ?? null);
            }}
            className={cn(
              "absolute inset-0 size-full object-cover transition-[filter,opacity,scale] duration-700 ease-out motion-reduce:transition-none",
              loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-xl",
            )}
          />
        )}
      </div>
      {caption && status === "done" ? (
        <figcaption className="px-1 text-xs text-gousse-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
