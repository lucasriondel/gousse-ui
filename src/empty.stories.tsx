import type { Meta, StoryObj } from "@storybook/react-vite";
import { Inbox } from "lucide-react";
import { Empty } from "./empty.js";
import { Button } from "./button.js";

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

/** `icon` renders in flow above the title. */
export const WithIcon: Story = {
  args: {
    variant: "dashed",
    title: "No messages",
    description: "Sync an account to start triaging your inbox.",
    icon: <Inbox className="size-8" />,
    action: <Button variant="primary">Sync now</Button>,
  },
};

/** `children` is an alias for `action` — the common `<Empty>…<Link/></Empty>` shape. */
export const ChildrenAsAction: Story = {
  args: {
    title: "No saved filters",
    description: "Save a search to pin it here.",
    children: <Button variant="primary">Save this search</Button>,
  },
};

export const TitleOnly: Story = { args: { title: "Nothing here yet" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Empty
        variant="dashed"
        icon={<Inbox className="size-8" />}
        title="Dashed + icon + action"
        description="The general nothing-here state."
        action={<Button variant="primary">Sync now</Button>}
      />
      <Empty
        variant="solid"
        title="Solid, no icon"
        description="The celebratory all-caught-up state."
      />
      <Empty variant="dashed" title="Title only" />
    </div>
  ),
};
