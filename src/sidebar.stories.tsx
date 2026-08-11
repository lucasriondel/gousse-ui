import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Inbox,
  Send,
  Archive,
  Tag,
  ChevronDown,
  ScrollText,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarShell,
  SidebarHeader,
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

const ICON = "sidebar-glyph h-4 w-4";

/** Category accents, as the `r g b` triplets `--hue` expects. */
const HUE = {
  social: "59 130 246",
  promos: "34 197 94",
  updates: "168 85 247",
} as const;

const Brand = () => (
  <span className="flex items-center gap-3 text-lg font-bold tracking-tight text-gousse-ink">
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gousse-accent/15 text-sm text-gousse-accent">
      g
    </span>
    gousse
  </span>
);

const Count = ({ n }: { n: number }) => (
  <span className="sidebar-count ml-auto text-xs tabular-nums text-gousse-muted">{n}</span>
);

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

        <SidebarGroup className="mt-3">
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

        <SidebarGroup className="mt-3">
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
        {/* aria-current="page" is what a router link sets; the CSS keys off it. */}
        <SidebarItem
          render={(p) => <a href="#settings" aria-current="page" {...p} />}
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
    <div className="flex h-[560px]">
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
    <div className="flex h-[560px]">
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
        <div className="flex h-[560px]">
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

/** Every row state side by side: rest, hover target, active, tinted, nested. */
export const AllVariants: Story = {
  args: { collapsed: false },
  render: () => (
    <div className="flex h-[560px]">
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
            <SidebarItem active icon={<Inbox aria-hidden className={ICON} />}>
              <span className="truncate">Active</span>
            </SidebarItem>
            <SidebarItem
              icon={<Inbox aria-hidden className={ICON} />}
              trailing={<Count n={3} />}
            >
              <span className="truncate">With count</span>
            </SidebarItem>
            <SidebarItem
              render={(p) => <a href="#current" aria-current="page" {...p} />}
              icon={<Settings aria-hidden className={ICON} />}
            >
              <span className="truncate">Link, aria-current</span>
            </SidebarItem>
          </SidebarGroup>

          <SidebarGroup className="mt-3">
            <SidebarGroupLabel>Hues</SidebarGroupLabel>
            {(
              [
                ["Social", HUE.social],
                ["Promotions", HUE.promos],
                ["Updates", HUE.updates],
              ] as const
            ).map(([label, hue]) => (
              <SidebarItem
                key={label}
                hue={hue}
                tinted
                icon={<Tag aria-hidden className={ICON} />}
              >
                <span className="truncate">{label}</span>
              </SidebarItem>
            ))}
            <SidebarItem active hue={HUE.social} icon={<Tag aria-hidden className={ICON} />}>
              <span className="truncate">Active, hued</span>
            </SidebarItem>
          </SidebarGroup>

          <SidebarGroup className="mt-3">
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
      <div className="flex-1 p-6">
        <SidebarTrigger />
      </div>
    </div>
  ),
};
