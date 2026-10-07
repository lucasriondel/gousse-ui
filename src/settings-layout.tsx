import type { ComponentProps, ReactNode } from "react";
import { cn } from "./utils.js";

/**
 * A settings page split into sections, each its own page, with a nav to switch
 * between them. Sections beat one long scroll once they answer unrelated
 * questions — stacked, they read as one form nobody finishes.
 *
 * Structure: SettingsLayout (the centred page) / SettingsHeader (+
 * SettingsHeading, SettingsBack, SettingsTitle) / SettingsBody (the nav + content
 * row) / SettingsNav (+ SettingsNavItem) / SettingsContent.
 *
 * Responsive by construction, no script: on `md+` the nav is a sticky column
 * beside the content; below it, the same list becomes a row above the content
 * that scrolls sideways, since a column would leave the section too little width
 * to read.
 *
 * Nothing here knows about routing. Which section is open is the consumer's to
 * say — pass `active` to the matching {@link SettingsNavItem}, and `render` to
 * swap its element for a router link.
 */

/* --------------------------------------------------------------------- page */

/**
 * The page frame — centred, capped at `max-w-5xl`, and at least a screen tall.
 * Stacks the header, any banner, and {@link SettingsBody}. Paints no
 * background: the ground is the `body`'s, and a capped column that drew its own
 * would show as a stripe on a wide screen.
 */
export function SettingsLayout({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-7 p-6 text-gousse-ink md:p-10",
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------- header */

/**
 * The header row: {@link SettingsHeading} on the left, whatever controls you
 * pass after it (a theme switcher, a save state) on the right.
 * `justify-between` does the placing, so any subset composes.
 */
export function SettingsHeader({ className, ...props }: ComponentProps<"header">) {
  return (
    <header
      className={cn(
        "flex animate-fade-in items-start justify-between gap-4 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

/** The left stack of the header — {@link SettingsBack} over {@link SettingsTitle}. */
export function SettingsHeading({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("min-w-0", className)} {...props} />;
}

const BACK_BASE =
  "inline-flex items-center gap-1.5 rounded-full py-1 text-sm font-medium text-gousse-muted outline-hidden transition-colors duration-150 ease-out hover:text-gousse-ink focus-visible:ring-2 focus-visible:ring-gousse-ink/30 [&_svg]:size-4 [&_svg]:shrink-0";

/**
 * What `render` receives on {@link SettingsBack} and {@link SettingsNavItem}.
 * Element-agnostic — an anchor-typed prop bag can't be spread onto a router
 * link with its own typing — so it stays to what any link accepts.
 */
export type SettingsLinkRenderProps = {
  className: string;
  children: ReactNode;
  "aria-current"?: "page";
};

type SettingsLinkRender = (props: SettingsLinkRenderProps) => ReactNode;

/**
 * The way out of settings, above the title. An `<a>` by default; pass `render`
 * to use a router link:
 *
 * ```tsx
 * <SettingsBack render={(p) => <Link to="/" {...p} />}>
 *   <ArrowLeft /> Portals
 * </SettingsBack>
 * ```
 */
export function SettingsBack({
  className,
  children,
  render,
  ...props
}: ComponentProps<"a"> & { render?: SettingsLinkRender }) {
  const backClass = cn(BACK_BASE, className);
  if (render) return <>{render({ className: backClass, children })}</>;

  return (
    <a className={backClass} {...props}>
      {children}
    </a>
  );
}

/** The page title. An `<h1>` — settings is a page, not a panel inside one. */
export function SettingsTitle({ className, ...props }: ComponentProps<"h1">) {
  return (
    <h1
      className={cn("mt-1 text-2xl font-bold tracking-tight text-gousse-ink", className)}
      {...props}
    />
  );
}

/* --------------------------------------------------------------------- body */

/** The nav + content row. Stacks below `md`, sits side by side above it. */
export function SettingsBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-6 md:flex-row md:gap-10", className)} {...props} />;
}

/**
 * The section nav. A sticky `w-44` column on `md+`; a row that scrolls sideways
 * below it. The list's `-mx-1 px-1` lets a row's focus ring clear the scroll
 * container's clip at either end, and `pb-1` does the same underneath.
 */
export function SettingsNav({
  className,
  children,
  "aria-label": ariaLabel = "Settings sections",
  ...props
}: ComponentProps<"nav">) {
  return (
    <nav aria-label={ariaLabel} className={cn("md:w-44 md:shrink-0", className)} {...props}>
      <ul className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:sticky md:top-10 md:mx-0 md:flex-col md:overflow-visible md:px-0 md:pb-0">
        {children}
      </ul>
    </nav>
  );
}

const ITEM_BASE =
  "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium outline-hidden transition-colors duration-150 ease-out md:w-full focus-visible:ring-2 focus-visible:ring-gousse-ink/30 [&_svg]:size-4 [&_svg]:shrink-0";
const ITEM_IDLE = "text-gousse-muted hover:bg-gousse-line/40 hover:text-gousse-ink";
const ITEM_ACTIVE = "bg-gousse-line/60 text-gousse-ink";

type SettingsNavItemProps = Omit<ComponentProps<"a">, "children"> & {
  /** The open section. Fills the row and sets `aria-current="page"`. */
  active?: boolean;
  /** Leading glyph — a lucide icon, sized by the row. */
  icon?: ReactNode;
  /** Render the row as your own element — a router link, most often. */
  render?: SettingsLinkRender;
  children?: ReactNode;
};

/**
 * One section in {@link SettingsNav} — its own `<li>`, so pass these as the
 * nav's direct children. An `<a>` by default; pass `render` for a router link:
 *
 * ```tsx
 * <SettingsNavItem
 *   active={pathname.startsWith("/settings/ai")}
 *   icon={<Sparkles />}
 *   render={(p) => <Link to="/settings/ai" {...p} />}
 * >
 *   AI
 * </SettingsNavItem>
 * ```
 *
 * The weight stays put across states, so the label doesn't reflow the row as
 * the selection moves.
 */
export function SettingsNavItem({
  active = false,
  icon,
  render,
  className,
  children,
  ...props
}: SettingsNavItemProps) {
  const shared = {
    className: cn(ITEM_BASE, active ? ITEM_ACTIVE : ITEM_IDLE, className),
    children: (
      <>
        {icon}
        {children}
      </>
    ),
    "aria-current": active ? ("page" as const) : undefined,
  };

  return <li>{render ? render(shared) : <a {...shared} {...props} />}</li>;
}

/**
 * The open section. `min-w-0` so a wide table inside scrolls itself instead of
 * pushing the nav off-screen.
 */
export function SettingsContent({ className, ...props }: ComponentProps<"main">) {
  return <main className={cn("min-w-0 flex-1", className)} {...props} />;
}
