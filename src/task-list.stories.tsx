import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { TaskList, type Task, type TaskStatus } from "./task-list.js";

const LABELS = [
  "Read the failing test output",
  "Locate the resolver config",
  "Add .js extensions to relative imports",
  "Run typecheck",
  "Run the ESM smoke test",
];

const make = (statuses: TaskStatus[], details: Record<number, string> = {}): Task[] =>
  LABELS.map((label, i) => ({
    id: String(i),
    label,
    status: statuses[i] ?? "pending",
    detail: details[i],
  }));

const IN_PROGRESS = make(["done", "done", "running", "pending", "pending"], {
  2: "src/badge.tsx, src/button.tsx",
});
const ALL_DONE = make(["done", "done", "done", "done", "done"]);
const WITH_FAILURE = make(["done", "done", "done", "failed", "skipped"], {
  3: "TS2835: Relative import paths need explicit file extensions",
});

function Animated() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s >= LABELS.length ? 0 : s + 1)), 1400);
    return () => clearInterval(id);
  }, []);
  const statuses = LABELS.map<TaskStatus>((_, i) =>
    i < step ? "done" : i === step ? "running" : "pending",
  );
  return <TaskList tasks={make(statuses)} />;
}

const meta = {
  title: "Ai Ui/Task List",
  component: TaskList,
  tags: ["autodocs"],
  args: { tasks: IN_PROGRESS },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof TaskList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};
export const AllDone: Story = { args: { tasks: ALL_DONE } };
export const WithFailure: Story = { args: { tasks: WITH_FAILURE } };
export const Collapsed: Story = { args: { defaultOpen: false } };
export const NotCollapsible: Story = { args: { collapsible: false } };
export const NoHeader: Story = { args: { title: null } };
export const Empty: Story = { args: { tasks: [] } };
export const AnimatedProgress: Story = { render: () => <Animated /> };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <TaskList tasks={IN_PROGRESS} title="In progress" />
      <TaskList tasks={ALL_DONE} title="All done" />
      <TaskList tasks={WITH_FAILURE} title="With failure" />
      <TaskList tasks={IN_PROGRESS} title="Collapsed" defaultOpen={false} />
      <TaskList tasks={IN_PROGRESS} title="Not collapsible" collapsible={false} />
    </div>
  ),
};
