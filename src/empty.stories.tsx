import type { Meta, StoryObj } from "@storybook/react-vite";
import { Empty } from "./empty";
import { Button } from "./button";

const meta = {
  title: "Primitives/Empty",
  component: Empty,
  tags: ["autodocs"],
  args: { title: "Nothing here yet" },
  argTypes: {
    variant: { control: "inline-radio", options: ["dashed", "solid"] },
  },
  decorators: [(Story) => <div className="w-[32rem]">{Story()}</div>],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashed: Story = {
  args: {
    variant: "dashed",
    title: "No messages",
    description: "Sync an account to start triaging your inbox.",
    action: <Button variant="primary">Sync now</Button>,
  },
};

export const Solid: Story = {
  args: {
    variant: "solid",
    title: "All caught up 🎉",
    description: "You've triaged everything in this view.",
  },
};
