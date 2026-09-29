import {
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  Mic,
  Plus,
  Square,
  Undo2,
  WandSparkles,
  X,
} from "lucide-react";
import { AudioWaves } from "./audio-waves.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu.js";
import { cn } from "./utils.js";

/**
 * The composer at the bottom of an agent chat: a growing text box over a
 * toolbar — attach (+) and model switch on the left; enhance, voice and send
 * on the right.
 *
 * Its states, all driven by props so the caller stays the source of truth:
 *
 * - **idle** — empty; send is disabled.
 * - **filled** — text in the box; send lights up. Enter sends, Shift+Enter
 *   breaks the line (and IME composition is left alone).
 * - **enhancing** — `enhancing` true: the "improve my prompt" pass is running.
 *   The box locks and the text shimmers while the rewrite comes back.
 * - **enhanced** — `enhanced` true: the rewrite is in; a chip offers undo.
 * - **running** — `running` true: the agent is answering; send becomes stop.
 * - **recording** — `recording` true: an {@link AudioWaves} takes the text
 *   box's place while the mic is live.
 *
 * Each toolbar control appears only when its handler (or data) is passed, so
 * the same component is a bare box or the full composer.
 *
 * The frame is a surface (`rounded-3xl`, a notch rounder than a card, since
 * its buttons are pills and the corners have to clear them), and the whole
 * frame takes the focus ring — you're focused on *the composer*, not on the
 * textarea inside it.
 */

export interface AgentModel {
  id: string;
  label: ReactNode;
  description?: ReactNode;
}

export interface AgentAttachment {
  id: string;
  name: ReactNode;
}

interface AgentInputProps extends Omit<ComponentProps<"form">, "onSubmit" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** The agent is answering: send becomes stop. */
  running?: boolean;
  onStop?: () => void;
  /** Shows the enhance button. */
  onEnhance?: () => void;
  enhancing?: boolean;
  enhanced?: boolean;
  onUndoEnhance?: () => void;
  models?: readonly AgentModel[];
  model?: string;
  onModelChange?: (id: string) => void;
  /** Items for the + menu — `DropdownMenuItem`s. */
  attachMenu?: ReactNode;
  attachments?: readonly AgentAttachment[];
  onRemoveAttachment?: (id: string) => void;
  /** Shows the mic button. */
  onToggleRecording?: () => void;
  recording?: boolean;
  /** Live mic levels for the waveform while recording. */
  levels?: readonly number[];
  /** Max rows before the box scrolls. */
  maxRows?: number;
}

const ICON_BUTTON =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full text-gousse-muted transition-[transform,colors] hover:bg-gousse-line/60 hover:text-gousse-ink active:scale-[0.92] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30 disabled:pointer-events-none disabled:opacity-40";

export function AgentInput({
  value: controlled,
  defaultValue = "",
  onValueChange,
  onSubmit,
  placeholder = "Ask anything…",
  disabled = false,
  running = false,
  onStop,
  onEnhance,
  enhancing = false,
  enhanced = false,
  onUndoEnhance,
  models,
  model,
  onModelChange,
  attachMenu,
  attachments,
  onRemoveAttachment,
  onToggleRecording,
  recording = false,
  levels,
  maxRows = 8,
  className,
  ...props
}: AgentInputProps) {
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ?? inner;
  const box = useRef<HTMLTextAreaElement>(null);
  const locked = disabled || enhancing;
  const canSend = !locked && !recording && value.trim().length > 0;
  const current = models?.find((m) => m.id === model) ?? models?.[0];

  const setValue = (next: string) => {
    if (controlled === undefined) setInner(next);
    onValueChange?.(next);
  };

  // Grow with the content up to `maxRows`, then scroll. `value` and
  // `recording` aren't read here, but each change resizes the box, so each
  // must re-measure it.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    const line = parseFloat(getComputedStyle(el).lineHeight) || 20;
    el.style.height = `${Math.min(el.scrollHeight, line * maxRows)}px`;
    // oxlint-disable-next-line react/exhaustive-effect-dependencies -- re-measure on content change
  }, [value, maxRows, recording]);

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (running) return onStop?.();
    if (!canSend) return;
    onSubmit?.(value.trim());
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      data-state={
        running
          ? "running"
          : recording
            ? "recording"
            : enhancing
              ? "enhancing"
              : enhanced
                ? "enhanced"
                : value
                  ? "filled"
                  : "idle"
      }
      className={cn(
        "flex w-full flex-col gap-1 rounded-3xl border border-gousse-line bg-gousse-panel p-2 shadow-gousse-md transition-[border-color,box-shadow] focus-within:border-gousse-ink/40 focus-within:shadow-gousse-lg",
        disabled && "opacity-60",
        className,
      )}
      {...props}
    >
      {attachments && attachments.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5 px-1 pt-1">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-gousse-line/50 pl-2.5 pr-1 text-xs font-medium text-gousse-ink"
            >
              <FileText size={12} aria-hidden className="text-gousse-muted" />
              <span className="max-w-40 truncate">{a.name}</span>
              {onRemoveAttachment ? (
                <button
                  type="button"
                  aria-label="Remove attachment"
                  onClick={() => onRemoveAttachment(a.id)}
                  className="inline-flex size-5 items-center justify-center rounded-full text-gousse-muted hover:bg-gousse-line hover:text-gousse-ink"
                >
                  <X size={11} />
                </button>
              ) : (
                <span className="w-1" />
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {recording ? (
        <div role="status" className="flex min-h-11 items-center gap-3 px-3 text-gousse-accent">
          <AudioWaves
            variant="mirrored"
            count={24}
            height={24}
            levels={levels}
            className="flex-1"
          />
          <span className="text-xs font-medium text-gousse-muted">Listening…</span>
        </div>
      ) : (
        <div className="relative">
          <textarea
            ref={box}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={enhancing}
            aria-busy={enhancing || undefined}
            aria-label={placeholder}
            className={cn(
              "block min-h-11 w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-6 text-gousse-ink outline-hidden placeholder:text-gousse-muted",
              enhancing && "gousse-shimmer cursor-progress",
            )}
          />
        </div>
      )}

      <div className="flex items-center gap-1">
        {attachMenu ? (
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Add" disabled={locked} className={ICON_BUTTON}>
              <Plus size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">{attachMenu}</DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {models && models.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={locked}
              className="inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-medium text-gousse-muted transition-colors hover:bg-gousse-line/60 hover:text-gousse-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30 disabled:opacity-40 data-[popup-open]:bg-gousse-line/60"
            >
              {current?.label}
              <ChevronDown size={12} aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" className="min-w-52">
              <DropdownMenuLabel>Model</DropdownMenuLabel>
              {models.map((m) => (
                <DropdownMenuItem key={m.id} onClick={() => onModelChange?.(m.id)}>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span>{m.label}</span>
                    {m.description ? (
                      <span className="text-xs font-normal text-gousse-muted">{m.description}</span>
                    ) : null}
                  </span>
                  {m.id === current?.id ? <Check size={14} className="text-gousse-ink" /> : null}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        <span className="flex-1" />

        {enhanced && onUndoEnhance && !enhancing ? (
          <button
            type="button"
            onClick={onUndoEnhance}
            className="inline-flex h-7 animate-fade-in items-center gap-1 rounded-full bg-gousse-accent/10 px-2.5 text-xs font-medium text-gousse-accent transition-colors hover:bg-gousse-accent/20"
          >
            <Undo2 size={12} aria-hidden />
            Undo enhance
          </button>
        ) : null}

        {onEnhance ? (
          <button
            type="button"
            aria-label="Enhance prompt"
            title="Enhance prompt"
            onClick={onEnhance}
            disabled={locked || recording || !value.trim()}
            className={cn(ICON_BUTTON, enhancing && "text-gousse-accent opacity-100")}
          >
            <WandSparkles size={16} className={enhancing ? "animate-sparkle-twinkle" : undefined} />
          </button>
        ) : null}

        {onToggleRecording ? (
          <button
            type="button"
            aria-label={recording ? "Stop recording" : "Voice input"}
            aria-pressed={recording}
            onClick={onToggleRecording}
            disabled={locked || running}
            className={cn(
              ICON_BUTTON,
              recording &&
                "bg-gousse-accent/15 text-gousse-accent hover:bg-gousse-accent/25 hover:text-gousse-accent",
            )}
          >
            <Mic size={16} />
          </button>
        ) : null}

        <button
          type="submit"
          aria-label={running ? "Stop" : "Send"}
          disabled={running ? !onStop : !canSend}
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-gousse-ink text-gousse-bg transition-[transform,colors,opacity] hover:bg-gousse-ink/90 active:scale-[0.92] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gousse-ink/30 focus-visible:ring-offset-2 focus-visible:ring-offset-gousse-panel disabled:bg-gousse-line disabled:text-gousse-muted"
        >
          {running ? (
            <Square size={12} fill="currentColor" />
          ) : (
            <ArrowUp size={16} strokeWidth={2.5} />
          )}
        </button>
      </div>
    </form>
  );
}
