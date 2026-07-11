import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sheen } from "./sheen";

const meta = {
  title: "Effects/Sheen",
  component: Sheen,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Sheen>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover the button — a light sweep runs once diagonally across it. */
export const Default: Story = {
  render: () => (
    <button
      type="button"
      className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-gousse-accent to-gousse-accent/80 px-5 py-2.5 text-[13.5px] font-bold text-white"
    >
      <Sheen />
      <span className="relative">Sync</span>
    </button>
  ),
};

/** Works on any rounded rectangle host, not just pills. */
export const OnCard: Story = {
  render: () => (
    <div className="group relative w-64 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-gousse-accent to-gousse-accent/70 p-6 text-white shadow-gousse-md">
      <Sheen />
      <p className="relative text-sm font-bold">Hover me</p>
    </div>
  ),
};
