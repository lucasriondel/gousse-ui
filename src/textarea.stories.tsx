import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input.js";
import { Select } from "./select.js";
import { Textarea } from "./textarea.js";

const meta = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { placeholder: "Write a reply…", rows: 4 },
  argTypes: { disabled: { control: "boolean" } },
  decorators: [(Story) => <div className="w-96">{Story()}</div>],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithValue: Story = {
  args: { defaultValue: "Thanks — I'll take a look and get back to you." },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "Read only" } };

/**
 * Shape against its siblings. Input and Select are pills; Textarea deliberately
 * is not — a tall box with fully-round ends loses its first and last lines to
 * the corner arc, so it takes `rounded-2xl` instead. Same chrome, different
 * radius, and this is the story that keeps the exception honest.
 */
export const ShapeAgainstSiblings: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Input placeholder="Input — pill" />
      <Select defaultValue="opus">
        <option value="opus">Select — pill</option>
      </Select>
      <Textarea rows={4} placeholder="Textarea — rounded-2xl, not a pill" />
    </div>
  ),
};
