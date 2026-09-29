import type { ComponentProps, KeyboardEvent } from "react";
import { useRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { cn } from "./utils.js";

export type ThemePreference = "light" | "system" | "dark";

const OPTIONS: { value: ThemePreference; icon: LucideIcon; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dark" },
];

/* Thumb offset per selected index. The thumb is exactly one segment wide, so
   each step is a whole 100% of its own width — no per-size pixel math. */
const THUMB_OFFSET = ["translate-x-0", "translate-x-full", "translate-x-[200%]"];

/**
 * The track is a recessed `bg` well ringed in `line`; the thumb is a raised
 * `panel` pill with the same ring — the secondary Button's surface. The
 * recess matters in dark mode, where `panel` is lighter than `bg` but darker
 * than a `line`-tinted track would be, so a thumb on a tinted track reads sunken.
 */
const track = cva(
  "relative inline-flex shrink-0 rounded-full bg-gousse-bg ring-1 ring-gousse-line ring-inset aria-disabled:opacity-50",
  {
    variants: {
      size: {
        default: "p-1.5",
        sm: "p-1",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const thumb = cva(
  "pointer-events-none absolute rounded-full bg-gousse-panel shadow-gousse-sm ring-1 ring-gousse-line transition-transform duration-250 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
  {
    variants: {
      size: {
        default: "top-1.5 left-1.5 size-9",
        sm: "top-1 left-1 size-7",
      },
    },
    defaultVariants: { size: "default" },
  },
);

/* Focus ring and press are the Button chassis', so keyboard focus looks the
   same on every gousse control. */
const item = cva(
  "relative inline-flex items-center justify-center rounded-full text-gousse-muted transition-[transform,color] hover:text-gousse-ink active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-gousse-accent focus-visible:ring-offset-1 focus-visible:ring-offset-gousse-bg focus-visible:outline-hidden disabled:cursor-not-allowed disabled:hover:text-gousse-muted aria-checked:text-gousse-ink",
  {
    variants: {
      size: {
        default: "size-9 [&_svg]:size-4",
        sm: "size-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: { size: "default" },
  },
);

interface ThemeSwitcherProps
  extends Omit<ComponentProps<"div">, "onChange" | "children">, VariantProps<typeof track> {
  value: ThemePreference;
  onValueChange: (next: ThemePreference) => void;
  /**
   * Offer a "System" choice between Light and Dark. Defaults to `true`. When
   * `false` and `value` is still `"system"`, no segment is checked and the
   * thumb hides — resolve the OS preference to a concrete value before passing
   * it in if you want one lit.
   */
  showSystem?: boolean;
  disabled?: boolean;
  /** Accessible names per option, for localisation. */
  labels?: Partial<Record<ThemePreference, string>>;
}

/**
 * Icon-only light / system / dark picker: a pill track with a sliding thumb.
 *
 * Controlled, like {@link Switch} — it reports the user's *preference* and
 * never touches the document. Resolving `"system"` against
 * `prefers-color-scheme`, persisting the choice and toggling the `.dark` class
 * the token sheet keys off are the consumer's job.
 *
 * A native-button `radiogroup` with roving tabindex: Tab lands on the checked
 * segment, arrow keys move and select, as in an OS segmented control.
 */
export function ThemeSwitcher({
  value,
  onValueChange,
  showSystem = true,
  disabled,
  labels,
  size,
  className,
  "aria-label": ariaLabel = "Theme",
  ...props
}: ThemeSwitcherProps) {
  const options = showSystem ? OPTIONS : OPTIONS.filter((o) => o.value !== "system");
  const selected = options.findIndex((o) => o.value === value);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    refs.current[next]?.focus();
    onValueChange(options[next].value);
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(track({ size }), className)}
      {...props}
    >
      {selected >= 0 && (
        <span aria-hidden="true" className={cn(thumb({ size }), THUMB_OFFSET[selected])} />
      )}
      {options.map(({ value: option, icon: Icon, label }, index) => (
        <button
          key={option}
          ref={(el) => {
            refs.current[index] = el;
          }}
          type="button"
          role="radio"
          aria-checked={index === selected}
          aria-label={labels?.[option] ?? label}
          tabIndex={index === (selected >= 0 ? selected : 0) ? 0 : -1}
          disabled={disabled}
          onClick={() => onValueChange(option)}
          onKeyDown={(event) => onKeyDown(event, index)}
          className={item({ size })}
        >
          <Icon aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
