import type { Meta, StoryObj } from "@storybook/react";
import { Avatar } from "./avatar";

const meta = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { email: "lucas@example.com" },
  argTypes: {
    chars: { control: "inline-radio", options: [1, 2] },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const SingleChar: Story = { args: { chars: 1 } };
export const WithImage: Story = {
  args: { avatarUrl: "https://i.pravatar.cc/64?img=12" },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar email="a@x.com" className="h-6 w-6" />
      <Avatar email="b@x.com" className="h-[34px] w-[34px]" />
      <Avatar email="c@x.com" className="h-12 w-12" />
    </div>
  ),
};
