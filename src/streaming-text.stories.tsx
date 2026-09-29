import type { Meta, StoryObj } from "@storybook/react-vite";
import { StreamingText, useSimulatedStream } from "./streaming-text.js";

const ANSWER = `The test is flaky because the debounce timer starts before fake timers are installed.

\`vi.useFakeTimers()\` runs after the first render, so the 300ms debounce is scheduled on the real clock and \`advanceTimersByTime\` never reaches it. Moving the setup into a \`beforeEach\` fixes the ordering, and the test passes 200 runs in a row locally.`;

const meta = {
  title: "Ai Ui/Streaming Text",
  component: StreamingText,
  tags: ["autodocs"],
  args: { text: ANSWER },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StreamingText>;

export default meta;
type Story = StoryObj<typeof meta>;

function StreamDemo() {
  const { text, streaming, restart } = useSimulatedStream(ANSWER);
  return (
    <div className="flex flex-col items-start gap-3">
      <StreamingText text={text} streaming={streaming} />
      <button
        type="button"
        className="rounded-full border border-gousse-line px-3 py-1 text-xs text-gousse-muted hover:text-gousse-ink"
        onClick={restart}
      >
        Replay
      </button>
    </div>
  );
}

export const Streaming: Story = { render: () => <StreamDemo /> };

export const Done: Story = { args: { streaming: false } };

export const Waiting: Story = { args: { text: "", streaming: true } };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <StreamingText text="" streaming />
      <StreamingText text={ANSWER.slice(0, 120)} streaming />
      <StreamingText text={ANSWER} />
    </div>
  ),
};
