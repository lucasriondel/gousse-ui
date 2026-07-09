import type { Meta, StoryObj } from "@storybook/react";
import { Spinner } from "./spinner";

const meta = {
  title: "Primitives/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: { size: { control: { type: "range", min: 12, max: 64, step: 2 } } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { size: 40 } };

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Spinner size={16} />
      <Spinner size={24} />
      <Spinner size={40} />
    </div>
  ),
};
