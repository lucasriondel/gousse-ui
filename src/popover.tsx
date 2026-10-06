import type { ComponentProps } from "react";
import { Popover as PopoverPrimitive } from "@base-ui-components/react/popover";
import { POPUP_ANIM } from "./dropdown-menu.js";
import { cn } from "./utils.js";

/**
 * shadcn-flavoured wrappers over Base UI's `Popover`, restyled onto the gousse
 * tokens so a popover is the same surface as the dropdown menu
 * (`bg-gousse-panel`, `border-gousse-line`, `rounded-2xl`, `shadow-gousse-xl`)
 * and shares its enter/exit motion ({@link POPUP_ANIM}).
 *
 * Structure: Popover (Root) / PopoverTrigger / PopoverContent (Portal →
 * Positioner → Popup) / PopoverHeader / PopoverTitle / PopoverDescription /
 * PopoverClose.
 *
 * A popover is the non-modal sibling of {@link Dialog}: rich content anchored
 * to its trigger, dismissed by Escape or a click outside. Reach for a dropdown
 * menu when the content is a list of actions, a tooltip when it is a label.
 */

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverClose = PopoverPrimitive.Close;

const POPOVER_SURFACE =
  "z-[70] flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-2xl border border-gousse-line bg-gousse-panel p-4 text-sm text-gousse-ink shadow-gousse-xl outline-hidden";

export function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<
    ComponentProps<typeof PopoverPrimitive.Positioner>,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-[70]"
      >
        <PopoverPrimitive.Popup className={cn(POPOVER_SURFACE, POPUP_ANIM, className)} {...props} />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

export function PopoverHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />;
}

export function PopoverTitle({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Title>) {
  return (
    <PopoverPrimitive.Title
      className={cn("text-sm font-bold tracking-tight text-gousse-ink", className)}
      {...props}
    />
  );
}

export function PopoverDescription({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Description>) {
  return (
    <PopoverPrimitive.Description
      className={cn("text-sm font-medium leading-relaxed text-gousse-muted", className)}
      {...props}
    />
  );
}
