import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select.js";

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

/**
 * The pill only holds because `.gousse-select` (effects.css) drops the native
 * appearance and repaints the chevron the reset removes. Rendered beside an
 * unstyled native <select> so a missing effects.css import is obvious: without
 * it this story shows OS-square corners and a doubled arrow.
 */
export const AgainstNative: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Select {...args}>
        <option>Styled — pill + custom chevron</option>
      </Select>
      <select>
        <option>Native</option>
      </select>
    </div>
  ),
};

/** A long option must not run under the chevron — the right inset clears it. */
export const LongOption: Story = {
  render: (args) => (
    <Select {...args}>
      <option value="opus">Claude Opus 4.8 — highest quality, slowest</option>
      <option value="haiku">Claude Haiku 4.5</option>
    </Select>
  ),
};
