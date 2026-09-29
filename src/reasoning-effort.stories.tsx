import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DEFAULT_EFFORT_LEVELS, ReasoningEffort } from "./reasoning-effort.js";

function Controlled() {
  const [value, setValue] = useState(2);
  return (
    <div className="flex flex-col items-start gap-3">
      <ReasoningEffort value={value} onValueChange={setValue} modelLabel="Opus 5.5" />
      <p className="text-xs text-gousse-muted">
        value = {value} ({DEFAULT_EFFORT_LEVELS[value]})
      </p>
    </div>
  );
}

const meta = {
  title: "Ai Ui/Reasoning Effort",
  component: ReasoningEffort,
  tags: ["autodocs"],
  argTypes: { disabled: { control: "boolean" } },
} satisfies Meta<typeof ReasoningEffort>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithModelLabel: Story = { args: { modelLabel: "Opus 5.5", defaultValue: 2 } };
export const ControlledValue: Story = { render: () => <Controlled /> };
export const CustomLevels: Story = {
  args: { levels: ["Fast", "Balanced", "Deep"], defaultValue: 0 },
};
export const Disabled: Story = { args: { disabled: true } };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-6">
      {DEFAULT_EFFORT_LEVELS.map((_, i) => (
        <ReasoningEffort key={i} defaultValue={i} modelLabel="Opus 5.5" />
      ))}
      <ReasoningEffort levels={["Fast", "Balanced", "Deep"]} defaultValue={1} />
      <ReasoningEffort disabled />
    </div>
  ),
};
