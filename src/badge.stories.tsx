import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./badge";

const meta = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Label" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: [
        "neutral",
        "colored",
        "system",
        "suggested",
        "suggestedNew",
        "action",
      ],
    },
    interactive: { control: "boolean" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { variant: "neutral" } };
export const Colored: Story = {
  args: {
    variant: "colored",
    style: { backgroundColor: "#dc7828", color: "#fff" },
    children: "Priority",
  },
};
export const Suggested: Story = { args: { variant: "suggested", children: "? Newsletter" } };
export const SuggestedNew: Story = {
  args: { variant: "suggestedNew", children: "+ Invoices" },
};
export const Action: Story = { args: { variant: "action", children: "Archive" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="colored" style={{ backgroundColor: "#dc7828", color: "#fff" }}>
        Colored
      </Badge>
      <Badge variant="suggested">? Suggested</Badge>
      <Badge variant="suggestedNew">+ New</Badge>
      <Badge variant="action">Action</Badge>
    </div>
  ),
};
