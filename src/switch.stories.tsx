import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./switch.js";

const meta = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { checked: false, onCheckedChange: () => {}, "aria-label": "Toggle" },
  argTypes: { disabled: { control: "boolean" } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [on, setOn] = useState(false);
    return <Switch {...args} checked={on} onCheckedChange={setOn} />;
  },
};

export const On: Story = {
  render: (args) => {
    const [on, setOn] = useState(true);
    return <Switch {...args} checked={on} onCheckedChange={setOn} />;
  },
};

export const Disabled: Story = {
  args: { disabled: true, checked: true },
};
