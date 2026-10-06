import type { ComponentProps } from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui-components/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";
import { FIELD_CHROME, FIELD_PILL } from "./field-chrome.js";
import { POPUP_ANIM } from "./dropdown-menu.js";
import { cn } from "./utils.js";

/**
 * shadcn-flavoured wrappers over Base UI's `Combobox` — a text field that
 * filters a list as you type — restyled onto the gousse tokens. The field is
 * an {@link Input} ({@link FIELD_CHROME} on a {@link FIELD_PILL}); the list is
 * the dropdown menu's surface, items and motion, so a combobox open beside a
 * menu reads as the same popup.
 *
 * Structure: Combobox (Root) / ComboboxInput (field + trigger + clear) /
 * ComboboxContent (Portal → Positioner → Popup) / ComboboxEmpty / ComboboxList
 * / ComboboxItem / ComboboxGroup / ComboboxLabel / ComboboxSeparator. For
 * multi-select, swap ComboboxInput for ComboboxChips holding ComboboxChip and
 * ComboboxChipsInput, and pass `multiple` to the root.
 *
 * Pass the options as `items` on the root and render them with a function
 * child of {@link ComboboxList} — Base UI then filters them against the input
 * (case- and accent-insensitive) and owns keyboard highlight, `aria-activedescendant`
 * and the `role="listbox"` wiring. Objects need `itemToStringLabel`.
 *
 * Reach for {@link Select} instead when the options are few and fixed: it keeps
 * the OS picker, which a combobox gives up to be searchable.
 */

export const Combobox = ComboboxPrimitive.Root;
export const ComboboxValue = ComboboxPrimitive.Value;
export const ComboboxCollection = ComboboxPrimitive.Collection;

/** Icon-button chrome for the trigger, clear and chip-remove buttons. */
const ICON_BUTTON =
  "grid size-7 shrink-0 place-items-center rounded-full text-gousse-muted transition-[background,transform] duration-150 hover:bg-gousse-line/60 hover:text-gousse-ink active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50";

/**
 * The search field. `showTrigger` (default on) draws the chevron that opens the
 * list without typing; `showClear` draws an × that empties the value. Both sit
 * inside the pill's right end, so the input's right inset widens to clear them.
 */
export function ComboboxInput({
  className,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Input> & {
  showTrigger?: boolean;
  showClear?: boolean;
}) {
  return (
    <div className={cn("relative inline-flex w-64 items-center", className)}>
      <ComboboxPrimitive.Input
        disabled={disabled}
        className={cn(
          FIELD_CHROME,
          FIELD_PILL,
          "h-9 w-full placeholder:text-gousse-muted disabled:cursor-not-allowed disabled:opacity-50",
          showTrigger && showClear ? "pr-16" : showTrigger || showClear ? "pr-10" : undefined,
        )}
        {...props}
      />
      <div className="absolute right-1 flex items-center">
        {showClear && (
          <ComboboxPrimitive.Clear aria-label="Clear" disabled={disabled} className={ICON_BUTTON}>
            <X size={14} aria-hidden />
          </ComboboxPrimitive.Clear>
        )}
        {showTrigger && (
          <ComboboxPrimitive.Trigger
            aria-label="Show options"
            disabled={disabled}
            className={cn(ICON_BUTTON, "data-[popup-open]:[&>svg]:rotate-180")}
          >
            <ChevronDown size={16} className="transition-transform duration-200" aria-hidden />
          </ComboboxPrimitive.Trigger>
        )}
      </div>
    </div>
  );
}

export function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  anchor,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Popup> &
  Pick<
    ComponentProps<typeof ComboboxPrimitive.Positioner>,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className="isolate z-[70]"
      >
        <ComboboxPrimitive.Popup
          className={cn(
            "group/combobox-content z-[70] max-h-(--available-height) w-(--anchor-width) min-w-[10rem] max-w-(--available-width) overflow-hidden rounded-2xl border border-gousse-line bg-gousse-panel text-gousse-ink shadow-gousse-xl outline-hidden",
            POPUP_ANIM,
            className,
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

export function ComboboxList({
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.List>) {
  return (
    <ComboboxPrimitive.List
      className={cn(
        "max-h-[min(18rem,var(--available-height))] scroll-py-2 overflow-y-auto overscroll-contain p-2 data-[empty]:p-0",
        className,
      )}
      {...props}
    />
  );
}

/** A row; the check on the right marks the selected value(s). */
export function ComboboxItem({
  className,
  children,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center gap-2 rounded-xl py-2 pl-2.5 pr-8 text-left text-sm font-medium text-gousse-ink outline-hidden transition-[background] duration-150",
        "data-[highlighted]:bg-gousse-line/40 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator className="absolute right-2.5 grid size-4 place-items-center text-gousse-ink">
        <Check size={14} aria-hidden />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  );
}

export function ComboboxGroup({
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Group>) {
  return <ComboboxPrimitive.Group className={cn(className)} {...props} />;
}

/** Group header, styled like {@link DropdownMenuLabel}. Must sit inside a {@link ComboboxGroup}. */
export function ComboboxLabel({
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.GroupLabel>) {
  return (
    <ComboboxPrimitive.GroupLabel
      className={cn(
        "px-2.5 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-gousse-muted",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxSeparator({
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Separator>) {
  return (
    <ComboboxPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-gousse-line", className)}
      {...props}
    />
  );
}

/** Shown only when filtering leaves nothing — the popup's `data-empty` reveals it. */
export function ComboboxEmpty({
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Empty>) {
  return (
    <ComboboxPrimitive.Empty
      className={cn(
        "hidden w-full justify-center px-3 py-4 text-center text-sm font-medium text-gousse-muted group-data-[empty]/combobox-content:flex",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The multi-select field: chips for the picked values, then the input, wrapping
 * onto new lines as they accumulate. It grows taller, so it is a
 * `rounded-2xl` box rather than a pill — the same reason {@link Textarea} is.
 * Pass its ref as `anchor` to {@link ComboboxContent} so the list spans the box.
 */
export function ComboboxChips({
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Chips>) {
  return (
    <ComboboxPrimitive.Chips
      className={cn(
        "flex min-h-9 w-72 flex-wrap items-center gap-1.5 rounded-2xl border border-gousse-line bg-gousse-panel px-2 py-1.5 text-sm text-gousse-ink focus-within:border-gousse-ink",
        className,
      )}
      {...props}
    />
  );
}

export function ComboboxChip({
  className,
  children,
  showRemove = true,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Chip> & { showRemove?: boolean }) {
  return (
    <ComboboxPrimitive.Chip
      className={cn(
        "flex h-6 w-fit items-center gap-1 whitespace-nowrap rounded-full bg-gousse-line/50 pl-2.5 text-xs font-medium text-gousse-ink data-[highlighted]:bg-gousse-line",
        showRemove ? "pr-0.5" : "pr-2.5",
        className,
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          aria-label="Remove"
          className="grid size-5 place-items-center rounded-full text-gousse-muted transition-colors hover:bg-gousse-line hover:text-gousse-ink"
        >
          <X size={12} aria-hidden />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

/** The text input inside {@link ComboboxChips}; it takes the rest of the row. */
export function ComboboxChipsInput({
  className,
  ...props
}: ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.Input
      className={cn(
        "min-w-16 flex-1 bg-transparent px-1.5 text-sm text-gousse-ink outline-hidden placeholder:text-gousse-muted",
        className,
      )}
      {...props}
    />
  );
}
