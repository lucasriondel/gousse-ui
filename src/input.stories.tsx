import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

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
