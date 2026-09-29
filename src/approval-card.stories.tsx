import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import {
  ApprovalCard,
  ApprovalCommand,
  ApprovalPlan,
  QuestionCard,
  type ApprovalStatus,
} from "./approval-card.js";
import { Button } from "./button.js";

const noop = () => {};

const COMMAND = <ApprovalCommand command="rm -rf dist && bun run build" cwd="~/dev/gousse-ui" />;
const PLAN = (
  <ApprovalPlan
    steps={[
      "Add .js extensions to 14 relative imports",
      "Switch moduleResolution to NodeNext",
      "Run typecheck and the ESM smoke test",
    ]}
  />
);

function Interactive() {
  const [status, setStatus] = useState<ApprovalStatus>("pending");
  useEffect(() => {
    if (status !== "running") return;
    const id = setTimeout(() => setStatus("approved"), 1800);
    return () => clearTimeout(id);
  }, [status]);
  return (
    <div className="flex flex-col items-start gap-3">
      <ApprovalCard
        className="w-full"
        title="Run a shell command"
        tool="bash"
        description="Clear the stale build before rebuilding."
        status={status}
        onApprove={() => setStatus("running")}
        onDeny={() => setStatus("denied")}
      >
        {COMMAND}
      </ApprovalCard>
      <Button variant="ghost" onClick={() => setStatus("pending")}>
        Reset
      </Button>
    </div>
  );
}

function Questions() {
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  return (
    <div className="flex flex-col gap-3">
      <QuestionCard
        questions={[
          {
            id: "scope",
            question: "Which packages should I migrate?",
            options: ["All", "Only web", "Only ui"],
          },
          { id: "tests", question: "Update snapshots if they change?", options: ["Yes", "No"] },
          {
            id: "commit",
            question: "How should I commit?",
            options: ["One commit", "Per package", "Don't commit"],
          },
        ]}
        onSubmit={setAnswers}
        onSkip={noop}
      />
      {answers ? <pre className="text-xs text-gousse-muted">{JSON.stringify(answers)}</pre> : null}
    </div>
  );
}

const meta = {
  title: "Ai Ui/Approval Card",
  component: ApprovalCard,
  tags: ["autodocs"],
  args: {
    title: "Run a shell command",
    tool: "bash",
    description: "Clear the stale build before rebuilding.",
    children: COMMAND,
    onApprove: noop,
    onDeny: noop,
  },
  argTypes: {
    risk: { control: "inline-radio", options: ["default", "caution", "danger"] },
    status: { control: "inline-radio", options: ["pending", "running", "approved", "denied"] },
  },
  decorators: [(Story) => <div className="max-w-md">{Story()}</div>],
} satisfies Meta<typeof ApprovalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pending: Story = {};
export const Caution: Story = {
  args: {
    risk: "caution",
    title: "Send an email",
    tool: "gmail.send",
    description: 'To team@example.com — "Release notes for v0.5".',
    children: undefined,
  },
};
export const Danger: Story = {
  args: {
    risk: "danger",
    title: "Delete a production database",
    tool: "postgres.drop",
    description: "This cannot be undone.",
    children: <ApprovalCommand command="DROP DATABASE app_production;" />,
    approveLabel: "Delete",
  },
};
export const Plan: Story = {
  args: {
    title: "Approve the migration plan",
    tool: undefined,
    description: "I'll make these changes, then stop for review.",
    children: PLAN,
  },
};
export const Running: Story = { args: { status: "running" } };
export const Approved: Story = { args: { status: "approved" } };
export const Denied: Story = { args: { status: "denied" } };
export const ClarifyingQuestions: Story = { render: () => <Questions /> };
export const InteractiveFlow: Story = { render: () => <Interactive /> };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ApprovalCard title="Run a shell command" tool="bash" onApprove={noop} onDeny={noop}>
        {COMMAND}
      </ApprovalCard>
      <ApprovalCard
        risk="caution"
        title="Send an email"
        tool="gmail.send"
        onApprove={noop}
        onDeny={noop}
      />
      <ApprovalCard
        risk="danger"
        title="Drop a database"
        tool="postgres.drop"
        onApprove={noop}
        onDeny={noop}
      >
        <ApprovalCommand command="DROP DATABASE app_production;" />
      </ApprovalCard>
      <ApprovalCard title="Approve the plan" onApprove={noop} onDeny={noop}>
        {PLAN}
      </ApprovalCard>
      <ApprovalCard title="Run a shell command" tool="bash" status="running">
        {COMMAND}
      </ApprovalCard>
      <ApprovalCard title="Run a shell command" status="approved" />
      <ApprovalCard title="Send an email" status="denied" />
      <Questions />
    </div>
  ),
};
