import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input.js";

const meta = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "you@example.com" },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="w-72">{Story()}</div>],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: "lucas@example.com" } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "locked" } };

/**
 * Narrow and numeric fields want `text-center`: inside a pill, a value pinned
 * to the left inset reads as broken. Centred (left) vs not (right) — the
 * meta's `w-72` wrapper is overridden so both sit at a realistic width.
 */
export const Numeric: Story = {
  decorators: [(Story) => <div className="flex items-center gap-3">{Story()}</div>],
  render: () => (
    <>
      <Input className="w-20 text-center" defaultValue="15" aria-label="Centred" />
      <Input className="w-20" defaultValue="15" aria-label="Uncentred" />
    </>
  ),
};
