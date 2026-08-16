import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Steps } from "./steps.js";
import { Button } from "./button.js";

const STEPS = [
  { id: "config", label: "Configure" },
  { id: "connect", label: "Connect a mailbox" },
  { id: "ai", label: "Set up AI" },
] as const;

const meta = {
  title: "Primitives/Steps",
  component: Steps,
  tags: ["autodocs"],
  args: { steps: STEPS, current: "connect", labels: true },
  argTypes: {
    current: { control: "select", options: STEPS.map((s) => s.id) },
    labels: { control: "boolean" },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing done yet — every marker but the first is upcoming. */
export const First: Story = { args: { current: "config" } };

/** One behind, one ahead: a check, a fill, a hollow. */
export const Middle: Story = { args: { current: "connect" } };

/** The last step — everything behind it is checked. */
export const Last: Story = { args: { current: "ai" } };

/** An index works as well as an id, for flows whose steps are unnamed. */
export const ByIndex: Story = { args: { current: 1 } };

/** `labels={false}` — markers only, for a shell too narrow for three labels. */
export const MarkersOnly: Story = { args: { current: "connect", labels: false } };

/** Two steps rather than three; the row centres itself either way. */
export const TwoSteps: Story = {
  args: {
    steps: [
      { id: "connect", label: "Connect" },
      { id: "done", label: "Done" },
    ],
    current: "connect",
  },
};

/** Walk it, to see the marker transition rather than infer it. */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [at, setAt] = useState(0);
    return (
      <div className="flex flex-col items-center gap-5">
        <Steps steps={STEPS} current={at} />
        <div className="flex gap-2">
          <Button disabled={at === 0} onClick={() => setAt((n) => n - 1)}>
            Back
          </Button>
          <Button
            variant="primary"
            disabled={at === STEPS.length - 1}
            onClick={() => setAt((n) => n + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {STEPS.map((step) => (
        <Steps key={step.id} steps={STEPS} current={step.id} />
      ))}
      <Steps steps={STEPS} current="connect" labels={false} />
    </div>
  ),
};
