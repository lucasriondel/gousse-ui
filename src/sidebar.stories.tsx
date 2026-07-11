import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox, Send, Archive, Settings, User } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarFooter,
} from "./sidebar";

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

const Demo = ({ collapsed }: { collapsed?: boolean }) => (
  <div className="h-[420px]">
    <Sidebar collapsed={collapsed}>
      <SidebarHeader>
        <span className="truncate group-data-[collapsed]/sidebar:hidden">Gousse</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsed]/sidebar:hidden">
            Mail
          </SidebarGroupLabel>
          <SidebarItem href="#" active icon={<Inbox className={ICON} />}>
            Inbox
          </SidebarItem>
          <SidebarItem href="#" icon={<Send className={ICON} />}>
            Sent
          </SidebarItem>
          <SidebarItem href="#" icon={<Archive className={ICON} />}>
            Archive
          </SidebarItem>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsed]/sidebar:hidden">
            System
          </SidebarGroupLabel>
          <SidebarItem href="#" icon={<Settings className={ICON} />}>
            Settings
          </SidebarItem>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <User className={ICON} />
        <span className="truncate text-sm font-medium group-data-[collapsed]/sidebar:hidden">
          lucas
        </span>
      </SidebarFooter>
    </Sidebar>
  </div>
);

export const Default: Story = {
  args: { collapsed: false },
  render: ({ collapsed }) => <Demo collapsed={collapsed} />,
};

export const Collapsed: Story = {
  args: { collapsed: true },
  render: ({ collapsed }) => <Demo collapsed={collapsed} />,
};
