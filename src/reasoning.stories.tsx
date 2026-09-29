import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Reasoning, ReasoningStep } from "./reasoning.js";

const meta = {
  title: "Ai Ui/Reasoning",
  component: Reasoning,
  tags: ["autodocs"],
  args: { children: null },
} satisfies Meta<typeof Reasoning>;

export default meta;
type Story = StoryObj<typeof meta>;

const STEPS = [
  { title: "Reading the request", detail: "The user wants the flaky login test fixed." },
  { title: "Locating the test", detail: "Found `auth/login.test.ts`, 3 cases using fake timers." },
  {
    title: "Checking the timer setup",
    detail: "`vi.useFakeTimers()` runs after the first render.",
  },
  {
    title: "Forming a hypothesis",
    detail: "The debounce fires on the real clock before timers are faked.",
  },
  { title: "Planning the fix", detail: "Move the fake-timer setup into `beforeEach`." },
];

function Trace({ count, live }: { count: number; live: boolean }) {
  return (
    <>
      {STEPS.slice(0, count).map((s, i) => (
        <ReasoningStep
          key={i}
          title={s.title}
          status={live && i === count - 1 ? "thinking" : "done"}
        >
          {s.detail}
        </ReasoningStep>
      ))}
    </>
  );
}

function LiveReasoning() {
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [count, setCount] = useState(1);
  const [run, setRun] = useState(0);
  const done = count > STEPS.length;

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCount((c) => c + 1), 800);
    return () => clearInterval(id);
  }, [done]);

  return (
    <div className="flex max-w-xl flex-col items-start gap-4">
      <Reasoning
        key={run}
        status={done ? "done" : "thinking"}
        startedAt={startedAt}
        duration={done ? STEPS.length * 800 : undefined}
      >
        <Trace count={Math.min(count, STEPS.length)} live={!done} />
      </Reasoning>
      <button
        type="button"
        className="rounded-full border border-gousse-line px-3 py-1 text-xs text-gousse-muted hover:text-gousse-ink"
        onClick={() => {
          setStartedAt(Date.now());
          setCount(1);
          setRun((r) => r + 1);
        }}
      >
        Replay
      </button>
    </div>
  );
}

export const Thinking: Story = { render: () => <LiveReasoning /> };

export const DoneCollapsed: Story = {
  render: () => (
    <div className="max-w-xl">
      <Reasoning status="done" duration={12000}>
        <Trace count={STEPS.length} live={false} />
      </Reasoning>
    </div>
  ),
};

export const DoneExpanded: Story = {
  render: () => (
    <div className="max-w-xl">
      <Reasoning status="done" duration={12000} defaultOpen>
        <Trace count={STEPS.length} live={false} />
      </Reasoning>
    </div>
  ),
};

export const PlainTextTrace: Story = {
  render: () => (
    <div className="max-w-xl">
      <Reasoning status="done" duration={3000} defaultOpen>
        The user asked for a summary, so I'll keep it to three bullets and lead with the decision
        rather than the background.
      </Reasoning>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <LiveReasoning />
      <Reasoning status="done" duration={12000}>
        <Trace count={STEPS.length} live={false} />
      </Reasoning>
      <Reasoning status="done" duration={12000} defaultOpen>
        <Trace count={STEPS.length} live={false} />
      </Reasoning>
    </div>
  ),
};
