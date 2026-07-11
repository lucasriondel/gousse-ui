import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-72">
      <p className="text-sm text-gousse-ink">Above</p>
      <Separator className="my-3" />
      <p className="text-sm text-gousse-ink">Below</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3 text-sm text-gousse-ink">
      <span>Inbox</span>
      <Separator orientation="vertical" />
      <span>Archive</span>
      <Separator orientation="vertical" />
      <span>Sent</span>
    </div>
  ),
};
