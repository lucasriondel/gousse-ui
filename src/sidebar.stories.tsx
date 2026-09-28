import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox, Send, Archive, Tag, ChevronDown, ScrollText, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarShell,
  SidebarHeader,
  SidebarTitle,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarClose,
  SidebarCollapsible,
} from "./sidebar.js";

const meta = {
  title: "Primitives/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  argTypes: { collapsed: { control: "boolean" } },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const ICON = "h-4 w-4";

/** Category accents, as the `r g b` triplets `--hue` expects. */
const HUE = {
  social: "59 130 246",
  promos: "34 197 94",
  updates: "168 85 247",
} as const;

/** The brand mark as a consumer ships it: an `<img>` filling the 26px slot —
 * the slot's own radius clips it. Served from `.storybook/public`;
 * harness-only, not part of any registry item. */
const Mark = () => <img src="gousse-mark.png" alt="" className="h-full w-full object-cover" />;

const Brand = () => <SidebarTitle mark={<Mark />}>gousse</SidebarTitle>;

/** `.sidebar-count` (sidebar-chrome.css) owns the styling: faint tabular
 * figures at rest, the row's hue beside the active row. */
const Count = ({ n }: { n: number }) => <span className="sidebar-count">{n}</span>;

/** The body every shell story reuses. */
const Body = ({ onToggle }: { onToggle?: () => void }) => {
  const [selected, setSelected] = useState("inbox");
  const [branchOpen, setBranchOpen] = useState(true);

  return (
    <>
      <SidebarHeader>
        <Brand />
        {onToggle ? <SidebarClose onClick={onToggle} /> : null}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarItem
            active={selected === "inbox"}
            onClick={() => setSelected("inbox")}
            icon={<Inbox aria-hidden className={ICON} />}
            trailing={<Count n={12} />}
          >
            <span className="truncate">Inbox</span>
          </SidebarItem>
          <SidebarItem
            active={selected === "sent"}
            onClick={() => setSelected("sent")}
            icon={<Send aria-hidden className={ICON} />}
          >
            <span className="truncate">Sent</span>
          </SidebarItem>
          <SidebarItem
            active={selected === "archive"}
            onClick={() => setSelected("archive")}
            icon={<Archive aria-hidden className={ICON} />}
          >
            <span className="truncate">Archive</span>
          </SidebarItem>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          {(
            [
              ["social", "Social", HUE.social],
              ["promos", "Promotions", HUE.promos],
              ["updates", "Updates", HUE.updates],
            ] as const
          ).map(([id, label, hue]) => (
            <SidebarItem
              key={id}
              active={selected === id}
              onClick={() => setSelected(id)}
              hue={hue}
              tinted
              icon={<Tag aria-hidden className={ICON} />}
            >
              <span className="truncate">{label}</span>
            </SidebarItem>
          ))}
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Labels</SidebarGroupLabel>
          <SidebarItem
            active={selected === "work"}
            onClick={() => setBranchOpen((o) => !o)}
            branchCollapsed={!branchOpen}
            icon={<Tag aria-hidden className={ICON} />}
            trailing={
              <ChevronDown
                aria-hidden
                className="sidebar-chevron ml-auto h-3.5 w-3.5 text-gousse-muted"
              />
            }
          >
            <span className="truncate">Work</span>
          </SidebarItem>
          <SidebarCollapsible collapsed={!branchOpen}>
            <SidebarItem
              depth={1}
              active={selected === "work/design"}
              onClick={() => setSelected("work/design")}
            >
              <span className="truncate">Design</span>
            </SidebarItem>
            <SidebarItem
              depth={1}
              active={selected === "work/eng"}
              onClick={() => setSelected("work/eng")}
            >
              <span className="truncate">Engineering</span>
            </SidebarItem>
          </SidebarCollapsible>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarItem
          render={(p) => <a href="#logs" {...p} />}
          icon={<ScrollText aria-hidden className={ICON} />}
        >
          <span className="truncate">Logs</span>
        </SidebarItem>
        {/* aria-current="page" is what a router link sets; the CSS keys off it
            the same as `data-active`. Driven by the shared selection here so
            the panel has one active row at a time, as a router would ensure. */}
        <SidebarItem
          render={(p) => (
            <a
              href="#settings"
              aria-current={selected === "settings" ? "page" : undefined}
              onClick={() => setSelected("settings")}
              {...p}
            />
          )}
          icon={<Settings aria-hidden className={ICON} />}
        >
          <span className="truncate">Settings</span>
        </SidebarItem>
      </SidebarFooter>
    </>
  );
};

/** Static shell — the sidebar beside a page, no responsive drawer. */
export const Default: Story = {
  args: { collapsed: false },
  render: ({ collapsed }) => (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed}>
        <Body />
      </Sidebar>
    </div>
  ),
};

/**
 * Collapsed narrows the shell to zero width rather than to an icon rail, so the
 * page reflows into the space. The panel stays mounted (and `inert`) so the
 * width transition has something to tween.
 */
export const Collapsed: Story = {
  args: { collapsed: true },
  render: ({ collapsed }) => (
    <div className="flex h-screen">
      <Sidebar collapsed={collapsed}>
        <Body />
      </Sidebar>
      <div className="flex-1 p-6 text-sm text-gousse-muted">
        Page content reflows into the reclaimed width.
      </div>
    </div>
  ),
};

/**
 * The mark's enter/leave: click a row and its stroke fades and grows in while
 * the old row's recedes — pure CSS on each row, no travelling element. Each
 * stroke carries its own row's hue.
 */
export const MarkEnterLeave: Story = {
  args: { collapsed: false },
  render: () => {
    const Harness = () => {
      const rows = [
        ["Inbox", Inbox, undefined],
        ["Sent", Send, HUE.social],
        ["Archive", Archive, HUE.promos],
        ["Logs", ScrollText, HUE.updates],
      ] as const;
      const [active, setActive] = useState("Inbox");
      return (
        <div className="flex h-screen">
          <Sidebar>
            <SidebarHeader>
              <SidebarTitle>gousse</SidebarTitle>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Mail</SidebarGroupLabel>
                {rows.map(([label, Icon, hue]) => (
                  <SidebarItem
                    key={label}
                    active={active === label}
                    hue={hue}
                    onClick={() => setActive(label)}
                    icon={<Icon aria-hidden className={ICON} />}
                  >
                    <span className="truncate">{label}</span>
                  </SidebarItem>
                ))}
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarItem
                active={active === "Settings"}
                onClick={() => setActive("Settings")}
                icon={<Settings aria-hidden className={ICON} />}
              >
                <span className="truncate">Settings</span>
              </SidebarItem>
            </SidebarFooter>
          </Sidebar>
          <div className="flex-1 p-6 text-sm text-gousse-muted">
            Click a row — its stroke fades in as the old one fades out, each in its own row's hue.
            Footer rows carry one the same way.
          </div>
        </div>
      );
    };
    return <Harness />;
  },
};

/**
 * No active row: no stroke anywhere. A panel whose current destination isn't
 * in the list (a detail route, a modal surface) simply marks nothing.
 */
export const MarkWithoutActiveRow: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>gousse</SidebarTitle>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Mail</SidebarGroupLabel>
            <SidebarItem icon={<Inbox aria-hidden className={ICON} />}>
              <span className="truncate">Inbox</span>
            </SidebarItem>
            <SidebarItem icon={<Send aria-hidden className={ICON} />}>
              <span className="truncate">Sent</span>
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 p-6 text-sm text-gousse-muted">
        Nothing is active, so no row carries a stroke.
      </div>
    </div>
  ),
};

/**
 * The active glyph takes the row's own hue, not the app accent. A row with a
 * forced `hue` keeps that colour when it becomes the active row, so the glyph,
 * the count and the mark all read as one colour — and a `tinted` category row
 * goes to full strength when active rather than staying at its rest tint.
 *
 * Two colours side by side: the un-hued row falls back to the accent, the
 * hued ones each hold their own.
 */
export const ActiveGlyphTakesRowHue: Story = {
  args: { collapsed: false },
  render: function Render() {
    const [active, setActive] = useState("social");
    const rows = [
      { id: "inbox", label: "Inbox", icon: Inbox, hue: undefined, tinted: false },
      { id: "social", label: "Social", icon: Tag, hue: HUE.social, tinted: true },
      { id: "promos", label: "Promotions", icon: Tag, hue: HUE.promos, tinted: true },
      { id: "updates", label: "Updates", icon: Tag, hue: HUE.updates, tinted: true },
    ];
    return (
      <div className="flex h-screen">
        <Sidebar>
          <SidebarHeader>
            <SidebarTitle>gousse</SidebarTitle>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Categories</SidebarGroupLabel>
              {rows.map((row) => (
                <SidebarItem
                  key={row.id}
                  active={active === row.id}
                  onClick={() => setActive(row.id)}
                  hue={row.hue}
                  tinted={row.tinted}
                  icon={<row.icon aria-hidden className={ICON} />}
                >
                  <span className="truncate">{row.label}</span>
                </SidebarItem>
              ))}
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 p-6 text-sm text-gousse-muted">
          Click each row — the glyph, the count and the mark always share the row&apos;s hue.
        </div>
      </div>
    );
  },
};

/**
 * The mark inside a scrolling list. It is part of the row, so it scrolls with
 * it and clips at the region's edge like any row content — no measuring, no
 * lag, nothing to drift.
 */
export const MarkInScrollRegion: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>gousse</SidebarTitle>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Many rows</SidebarGroupLabel>
            {Array.from({ length: 24 }, (_, i) => (
              <SidebarItem key={i} active={i === 11} icon={<Tag aria-hidden className={ICON} />}>
                <span className="truncate">Label {i + 1}</span>
              </SidebarItem>
            ))}
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 p-6 text-sm text-gousse-muted">
        Scroll the panel — the mark tracks row 12.
      </div>
    </div>
  ),
};

/**
 * The real app shell: `SidebarShell` + `SidebarTrigger`, wired to one piece of
 * state. Narrow the viewport to see the mobile drawer and its scrim.
 */
export const Responsive: Story = {
  args: { collapsed: false },
  render: ({ collapsed: initial }) => {
    const Harness = () => {
      const [collapsed, setCollapsed] = useState(initial ?? false);
      const toggle = () => setCollapsed((c) => !c);
      return (
        <div className="flex h-screen">
          <SidebarShell collapsed={collapsed} onToggle={toggle}>
            <Body onToggle={toggle} />
          </SidebarShell>
          <div className="group/bar flex-1 p-4" data-scrolled="false">
            <div className="flex items-center gap-3">
              {collapsed ? <SidebarTrigger onClick={toggle} /> : null}
              <span className="text-sm font-medium text-gousse-ink">Inbox</span>
            </div>
          </div>
        </div>
      );
    };
    return <Harness />;
  },
};

/* ------------------------------------------------------------ SidebarTitle */

/** The brand row as it usually appears: a mark beside the product name. */
export const Title: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle mark={<Mark />}>gousse</SidebarTitle>
          <SidebarClose />
        </SidebarHeader>
      </Sidebar>
    </div>
  ),
};

/**
 * No mark. The slot keeps its width regardless, so the name sits on the same
 * vertical line as a titled row that has one.
 */
export const TitleWithoutMark: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle>gousse</SidebarTitle>
          <SidebarClose />
        </SidebarHeader>
      </Sidebar>
    </div>
  ),
};

/**
 * As a link to the app root. `render` hands the computed class string to your
 * own element — a router `NavLink` in an app, a plain `<a>` here — so this file
 * takes on no router dependency.
 */
export const TitleAsLink: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader>
          <SidebarTitle mark={<Mark />} render={(p) => <a href="#root" {...p} />}>
            gousse
          </SidebarTitle>
          <SidebarClose />
        </SidebarHeader>
      </Sidebar>
    </div>
  ),
};

/**
 * The three side by side, stacked so the shared text baseline is visible: with
 * a mark, without one, and as a link (hover it to see the opacity fade take the
 * mark and the name together).
 */
export const TitleAllVariants: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-screen">
      <Sidebar>
        <SidebarHeader className="flex-col items-stretch gap-3">
          <SidebarTitle mark={<Mark />}>With mark</SidebarTitle>
          <SidebarTitle>Without mark</SidebarTitle>
          <SidebarTitle mark={<Mark />} render={(p) => <a href="#root" {...p} />}>
            As a link
          </SidebarTitle>
        </SidebarHeader>
      </Sidebar>
    </div>
  ),
};

/**
 * The state catalogue: rest, count, disabled, depth, active (by `data-active`
 * and by `aria-current`), tinted hues, and a `markHue` split from the row hue.
 * Split into panels so each active treatment reads against its own neighbours.
 */
export const AllVariants: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-screen gap-px bg-gousse-line">
      {/* Row states — the active one lives in its own panel below. */}
      <Sidebar>
        <SidebarHeader>
          <Brand />
          <SidebarClose />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>States</SidebarGroupLabel>
            <SidebarItem icon={<Inbox aria-hidden className={ICON} />}>
              <span className="truncate">Rest</span>
            </SidebarItem>
            <SidebarItem icon={<Inbox aria-hidden className={ICON} />} trailing={<Count n={3} />}>
              <span className="truncate">With count</span>
            </SidebarItem>
            <SidebarItem disabled icon={<Inbox aria-hidden className={ICON} />}>
              <span className="truncate">Disabled</span>
            </SidebarItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Depth</SidebarGroupLabel>
            <SidebarItem icon={<Tag aria-hidden className={ICON} />}>
              <span className="truncate">Parent</span>
            </SidebarItem>
            <SidebarItem depth={1}>
              <span className="truncate">Child</span>
            </SidebarItem>
            <SidebarItem depth={2}>
              <span className="truncate">Grandchild</span>
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarItem icon={<ScrollText aria-hidden className={ICON} />}>
            <span className="truncate">Logs</span>
          </SidebarItem>
        </SidebarFooter>
      </Sidebar>

      {/* Active by `active`, and the same row hued. */}
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Active</SidebarGroupLabel>
            <SidebarItem active icon={<Inbox aria-hidden className={ICON} />}>
              <span className="truncate">Active</span>
            </SidebarItem>
            <SidebarItem icon={<Inbox aria-hidden className={ICON} />}>
              <span className="truncate">Sibling at rest</span>
            </SidebarItem>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Hues</SidebarGroupLabel>
            <SidebarItem hue={HUE.social} tinted icon={<Tag aria-hidden className={ICON} />}>
              <span className="truncate">Social</span>
            </SidebarItem>
            <SidebarItem hue={HUE.promos} tinted icon={<Tag aria-hidden className={ICON} />}>
              <span className="truncate">Promotions</span>
            </SidebarItem>
            <SidebarItem hue={HUE.updates} tinted icon={<Tag aria-hidden className={ICON} />}>
              <span className="truncate">Updates</span>
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Active by `aria-current`, which the mark honours identically. */}
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>aria-current</SidebarGroupLabel>
            <SidebarItem icon={<Inbox aria-hidden className={ICON} />}>
              <span className="truncate">Rest</span>
            </SidebarItem>
            <SidebarItem
              render={(p) => <a href="#current" aria-current="page" {...p} />}
              icon={<Settings aria-hidden className={ICON} />}
            >
              <span className="truncate">Link, aria-current</span>
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* `markHue` recolors the stroke alone; the row keeps its own `hue`. */}
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Mark hue</SidebarGroupLabel>
            <SidebarItem
              active
              hue={HUE.promos}
              markHue={HUE.updates}
              icon={<Tag aria-hidden className={ICON} />}
            >
              <span className="truncate">Mark vs row hue</span>
            </SidebarItem>
            <SidebarItem hue={HUE.promos} icon={<Tag aria-hidden className={ICON} />}>
              <span className="truncate">Same hue, inactive</span>
            </SidebarItem>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </div>
  ),
};
