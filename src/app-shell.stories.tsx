import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  Inbox,
  Plus,
  Receipt,
  Search,
  Settings,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  AppShell,
  AppMain,
  AppContent,
  TopBar,
  TopBarStart,
  TopBarTitle,
  TopBarEnd,
  useAppShell,
} from "./app-shell.js";
import {
  SidebarShell,
  SidebarHeader,
  SidebarTitle,
  SidebarClose,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
} from "./sidebar.js";
import { Button } from "./button.js";

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const NAV = [
  { id: "transactions", label: "Transactions", icon: Receipt, count: "1,284" },
  { id: "transfers", label: "Transfers", icon: Wallet, count: "12" },
  { id: "inbox", label: "Inbox", icon: Inbox },
];

/** The sidebar half, shared by every story so each one only shows its own point. */
function Nav({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const [active, setActive] = useState("transactions");

  return (
    <SidebarShell collapsed={collapsed} onToggle={onToggle}>
      <SidebarHeader>
        <SidebarTitle mark="💰">mamen</SidebarTitle>
        <SidebarClose onClick={onToggle} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Money</SidebarGroupLabel>
          {NAV.map((item) => (
            <SidebarItem
              key={item.id}
              active={active === item.id}
              onClick={() => setActive(item.id)}
              icon={<item.icon className="size-4" aria-hidden />}
              trailing={item.count ? <span className="sidebar-count">{item.count}</span> : null}
            >
              {item.label}
            </SidebarItem>
          ))}
        </SidebarGroup>
      </SidebarContent>
    </SidebarShell>
  );
}

/** Placeholder page content — enough rows to make the content region scroll. */
function GhostRows({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      <div className="mb-5 h-5 w-44 rounded-md bg-gousse-line/75" />
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="h-8 rounded-lg bg-gousse-line/40"
          style={{ width: [92, 84, 88, 76, 90, 82][i % 6] + "%" }}
        />
      ))}
    </div>
  );
}

/**
 * The whole frame, wired through `useAppShell`. Note the two-tone split: the
 * sidebar sits on `bg-gousse-bg` and the content column on `bg-gousse-panel`.
 */
export const Default: Story = {
  render: () => {
    const { collapsed, toggle, contentRef, contentNode } = useAppShell();
    return (
      <AppShell>
        <Nav collapsed={collapsed} onToggle={toggle} />
        <AppMain>
          <TopBar collapsed={collapsed} onToggle={toggle} scrollNode={contentNode}>
            <TopBarTitle>Transactions</TopBarTitle>
          </TopBar>
          <AppContent ref={contentRef}>
            <GhostRows />
          </AppContent>
        </AppMain>
      </AppShell>
    );
  },
};

/**
 * Collapsed: the sidebar animates to zero width and the bar renders the open
 * button ahead of its own children on its own.
 */
export const Collapsed: Story = {
  render: () => {
    const { collapsed, toggle, contentRef, contentNode } = useAppShell(true);
    return (
      <AppShell>
        <Nav collapsed={collapsed} onToggle={toggle} />
        <AppMain>
          <TopBar collapsed={collapsed} onToggle={toggle} scrollNode={contentNode}>
            <TopBarTitle>Transactions</TopBarTitle>
          </TopBar>
          <AppContent ref={contentRef}>
            <GhostRows />
          </AppContent>
        </AppMain>
      </AppShell>
    );
  },
};

/** Title plus a trailing cluster of actions — the common list-view bar. */
export const WithActions: Story = {
  render: () => {
    const { collapsed, toggle, contentRef, contentNode } = useAppShell();
    return (
      <AppShell>
        <Nav collapsed={collapsed} onToggle={toggle} />
        <AppMain>
          <TopBar collapsed={collapsed} onToggle={toggle} scrollNode={contentNode}>
            <TopBarTitle>Transactions</TopBarTitle>
            <TopBarEnd>
              <Button variant="ghost" aria-label="Search">
                <Search className="size-4" aria-hidden />
              </Button>
              <Button variant="ghost" aria-label="Notifications">
                <Bell className="size-4" aria-hidden />
              </Button>
              <Button>
                <Plus className="size-4" aria-hidden />
                New
              </Button>
            </TopBarEnd>
          </TopBar>
          <AppContent ref={contentRef}>
            <GhostRows />
          </AppContent>
        </AppMain>
      </AppShell>
    );
  },
};

/**
 * Scroll the content: the bar flips `data-scrolled` and the collapsed sidebar's
 * trigger takes a panel surface so it stays legible over the rows passing under
 * it. Starts collapsed so the trigger is the thing on screen to watch.
 */
export const ScrolledContent: Story = {
  render: () => {
    const { collapsed, toggle, contentRef, contentNode } = useAppShell(true);
    return (
      <AppShell>
        <Nav collapsed={collapsed} onToggle={toggle} />
        <AppMain>
          <TopBar collapsed={collapsed} onToggle={toggle} scrollNode={contentNode}>
            <TopBarTitle>Transactions</TopBarTitle>
            <TopBarEnd>
              <Button variant="ghost" aria-label="Settings">
                <Settings className="size-4" aria-hidden />
              </Button>
            </TopBarEnd>
          </TopBar>
          <AppContent ref={contentRef}>
            <GhostRows count={40} />
          </AppContent>
        </AppMain>
      </AppShell>
    );
  },
};

/**
 * A back button in the leading cluster — the detail-view shape. The title sits
 * between the clusters, so it starts after the button rather than beside it.
 */
export const WithBackButton: Story = {
  render: () => {
    const { collapsed, toggle, contentRef, contentNode } = useAppShell();
    return (
      <AppShell>
        <Nav collapsed={collapsed} onToggle={toggle} />
        <AppMain>
          <TopBar collapsed={collapsed} onToggle={toggle} scrollNode={contentNode}>
            <TopBarStart>
              <Button variant="ghost" aria-label="Back to transactions">
                <ArrowLeft className="size-4" aria-hidden />
              </Button>
            </TopBarStart>
            <TopBarTitle>Monoprix — 24 Aug</TopBarTitle>
            <TopBarEnd>
              <Button variant="ghost" aria-label="Delete">
                <Trash2 className="size-4" aria-hidden />
              </Button>
              <Button>Save</Button>
            </TopBarEnd>
          </TopBar>
          <AppContent ref={contentRef}>
            <GhostRows count={5} />
          </AppContent>
        </AppMain>
      </AppShell>
    );
  },
};

/**
 * The title centred against the bar. It is centred on the **bar**, not on the
 * gap between the clusters — so it stays put as the two sides change width.
 * The lopsided clusters here are the point: one control left, three right.
 */
export const CenteredTitle: Story = {
  render: () => {
    const { collapsed, toggle, contentRef, contentNode } = useAppShell();
    return (
      <AppShell>
        <Nav collapsed={collapsed} onToggle={toggle} />
        <AppMain>
          <TopBar collapsed={collapsed} onToggle={toggle} scrollNode={contentNode}>
            <TopBarStart>
              <Button variant="ghost" aria-label="Back">
                <ArrowLeft className="size-4" aria-hidden />
              </Button>
            </TopBarStart>
            <TopBarTitle centered>Transactions</TopBarTitle>
            <TopBarEnd>
              <Button variant="ghost" aria-label="Search">
                <Search className="size-4" aria-hidden />
              </Button>
              <Button variant="ghost" aria-label="Notifications">
                <Bell className="size-4" aria-hidden />
              </Button>
              <Button>
                <Plus className="size-4" aria-hidden />
                New
              </Button>
            </TopBarEnd>
          </TopBar>
          <AppContent ref={contentRef}>
            <GhostRows count={5} />
          </AppContent>
        </AppMain>
      </AppShell>
    );
  },
};

/** One bar, rendered standalone, so a configuration can be read on its own. */
function BarCase({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gousse-muted">
        {label}
      </div>
      <div className="overflow-hidden rounded-2xl border border-gousse-line bg-gousse-panel">
        <TopBar>{children}</TopBar>
      </div>
    </div>
  );
}

/**
 * Every arrangement of the bar's three parts, side by side. Each part is
 * optional and none of them needs the others, so a bar can be a bare title, a
 * pair of clusters with no title, or the full set.
 */
export const BarConfigurations: Story = {
  render: () => (
    <div className="space-y-6 bg-gousse-bg p-6">
      <BarCase label="Title only">
        <TopBarTitle>Transactions</TopBarTitle>
      </BarCase>

      <BarCase label="Title + actions">
        <TopBarTitle>Transactions</TopBarTitle>
        <TopBarEnd>
          <Button variant="ghost" aria-label="Search">
            <Search className="size-4" aria-hidden />
          </Button>
          <Button>
            <Plus className="size-4" aria-hidden />
            New
          </Button>
        </TopBarEnd>
      </BarCase>

      <BarCase label="Back + title + actions">
        <TopBarStart>
          <Button variant="ghost" aria-label="Back">
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        </TopBarStart>
        <TopBarTitle>Monoprix — 24 Aug</TopBarTitle>
        <TopBarEnd>
          <Button>Save</Button>
        </TopBarEnd>
      </BarCase>

      <BarCase label="Centred title, lopsided clusters">
        <TopBarStart>
          <Button variant="ghost" aria-label="Back">
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        </TopBarStart>
        <TopBarTitle centered>Transactions</TopBarTitle>
        <TopBarEnd>
          <Button variant="ghost" aria-label="Search">
            <Search className="size-4" aria-hidden />
          </Button>
          <Button variant="ghost" aria-label="Notifications">
            <Bell className="size-4" aria-hidden />
          </Button>
          <Button>New</Button>
        </TopBarEnd>
      </BarCase>

      <BarCase label="No title — clusters only">
        <TopBarStart>
          <Button variant="ghost" aria-label="Back">
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        </TopBarStart>
        <TopBarEnd>
          <Button variant="ghost" aria-label="Settings">
            <Settings className="size-4" aria-hidden />
          </Button>
        </TopBarEnd>
      </BarCase>

      <BarCase label="Long title truncates, controls hold">
        <TopBarStart>
          <Button variant="ghost" aria-label="Back">
            <ArrowLeft className="size-4" aria-hidden />
          </Button>
        </TopBarStart>
        <TopBarTitle>
          A transaction description long enough that the bar has to give way somewhere, and the
          title is what gives
        </TopBarTitle>
        <TopBarEnd>
          <Button variant="ghost" aria-label="Delete">
            <Trash2 className="size-4" aria-hidden />
          </Button>
          <Button>Save</Button>
        </TopBarEnd>
      </BarCase>

      {/* `collapsed` lives on the bar itself, so this one can't go through BarCase. */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gousse-muted">
          Collapsed sidebar — trigger leads
        </div>
        <div className="overflow-hidden rounded-2xl border border-gousse-line bg-gousse-panel">
          <TopBar collapsed>
            <TopBarTitle>Transactions</TopBarTitle>
            <TopBarEnd>
              <Button>New</Button>
            </TopBarEnd>
          </TopBar>
        </div>
      </div>
    </div>
  ),
};

/** No sidebar at all — the bar is a plain layout row and the split still holds. */
export const BarOnly: Story = {
  render: () => {
    const { contentRef, contentNode } = useAppShell();
    return (
      <AppShell>
        <AppMain className="border-l-0">
          <TopBar scrollNode={contentNode}>
            <TopBarTitle>Settings</TopBarTitle>
          </TopBar>
          <AppContent ref={contentRef}>
            <GhostRows count={4} />
          </AppContent>
        </AppMain>
      </AppShell>
    );
  },
};
