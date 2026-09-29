import type { Meta, StoryObj } from "@storybook/react-vite";
import { CopyButton } from "./copy-button.js";

const meta = {
  title: "Ai Ui/Copy Button",
  component: CopyButton,
  tags: ["autodocs"],
  args: { value: "bun add class-variance-authority" },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongHold: Story = { args: { timeout: 4000 } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-3 rounded-full border border-gousse-line bg-gousse-panel py-1 pl-4 pr-1 font-mono text-xs">
      bun add class-variance-authority
      <CopyButton value="bun add class-variance-authority" />
    </div>
  ),
};
