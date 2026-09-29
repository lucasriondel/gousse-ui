import { useEffect, useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "./utils.js";

/**
 * A small icon button that copies `value` to the clipboard and flips to a check
 * for a moment to say so. The shared copy affordance of the agent components —
 * CodeBlock's header, TextResponse's action row — so the feedback reads the
 * same wherever something can be copied.
 *
 * A pill, like every gousse control, and `ghost`-quiet at rest: it sits on top
 * of content and should not compete with it. The label flips with the state so
 * a screen reader hears "Copied" as well as a sighted user seeing the check.
 */

interface CopyButtonProps extends Omit<ComponentProps<"button">, "value" | "children"> {
  value: string;
  /** How long the check holds, in ms. */
  timeout?: number;
  onCopied?: () => void;
}

export function CopyButton({
  value,
  timeout = 1600,
  onCopied,
  className,
  onClick,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), timeout);
    return () => clearTimeout(id);
  }, [copied, timeout]);

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy"}
      title={copied ? "Copied" : "Copy"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        void navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          onCopied?.();
        });
      }}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-full text-gousse-muted transition-[transform,colors] hover:bg-gousse-line/60 hover:text-gousse-ink active:scale-[0.92] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30",
        copied && "text-gousse-low hover:text-gousse-low",
        className,
      )}
      {...props}
    >
      {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
    </button>
  );
}
