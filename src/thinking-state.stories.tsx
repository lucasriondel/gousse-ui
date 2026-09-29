import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThinkingState } from "./thinking-state.js";

const meta = {
  title: "Ai Ui/Thinking State",
  component: ThinkingState,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["thinking", "done"] },
  },
} satisfies Meta<typeof ThinkingState>;

export default meta;
type Story = StoryObj<typeof meta>;

function LiveClock() {
  const [startedAt] = useState(() => Date.now());
  return <ThinkingState status="thinking" startedAt={startedAt} />;
}

export const Thinking: Story = { render: () => <LiveClock /> };

export const Done: Story = { args: { status: "done", duration: 4200 } };

export const NoClock: Story = { args: { status: "thinking" } };

export const CustomLabel: Story = {
  args: { status: "thinking", label: "Searching the codebase" },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <LiveClock />
      <ThinkingState status="thinking" />
      <ThinkingState status="thinking" label="Reading 14 files" />
      <ThinkingState status="done" duration={4200} />
      <ThinkingState status="done" duration={83000} />
      <ThinkingState status="done" />
    </div>
  ),
};
