import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select";

const meta = {
  title: "Primitives/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: { disabled: { control: "boolean" } },
  render: (args) => (
    <Select {...args}>
      <option value="opus">Claude Opus 4.8</option>
      <option value="sonnet">Claude Sonnet 5</option>
      <option value="haiku">Claude Haiku 4.5</option>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
