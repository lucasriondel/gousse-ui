import type { ComponentProps } from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui-components/react/tooltip";
import { POPUP_ANIM } from "./dropdown-menu.js";
import { cn } from "./utils.js";

/**
 * shadcn-flavoured wrappers over Base UI's `Tooltip`, restyled onto the gousse
 * tokens. The bubble is **inverted** — `bg-gousse-ink` with `text-gousse-bg` —
 * so it reads as a label floating over the UI rather than another panel in it,
 * and it flips with the theme because both tokens do.
 *
 * Structure: TooltipProvider / Tooltip (Root) / TooltipTrigger /
 * TooltipContent (Portal → Positioner → Popup + Arrow).
 *
 * Shaped as a pill: a tooltip is one short line, and gousse rounds anything
 * that short all the way. Keep the copy to a label — a tooltip that needs a
 * paragraph is a {@link Popover}.
 *
 * Wrap the app (or a toolbar) in one {@link TooltipProvider}: it shares the
 * open delay across tooltips, so once one is showing, moving to its neighbour
 * opens the next instantly instead of waiting out the delay again.
 */

export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipProvider({
  delay = 300,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

export function TooltipContent({
  className,
  side = "top",
  sideOffset = 6,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Popup> &
  Pick<
    ComponentProps<typeof TooltipPrimitive.Positioner>,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-[80]"
      >
        <TooltipPrimitive.Popup
          className={cn(
            "z-[80] w-fit max-w-xs rounded-full bg-gousse-ink px-3 py-1 text-xs font-medium text-gousse-bg shadow-gousse-md",
            POPUP_ANIM,
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="size-2 rotate-45 rounded-[2px] bg-gousse-ink data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
