import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileDiff, parseUnifiedDiff, type DiffReviewStatus } from "./file-diff.js";

const PATCH = ` import { describe, it, expect, vi } from "vitest";
 import { login } from "./login";

 describe("login", () => {
-  it("debounces submit", async () => {
-    render(<LoginForm />);
-    vi.useFakeTimers();
+  beforeEach(() => {
+    vi.useFakeTimers();
+  });
+
+  it("debounces submit", async () => {
+    render(<LoginForm />);
     await user.click(submit);
     vi.advanceTimersByTime(300);
     expect(login).toHaveBeenCalledOnce();`;

const rows = parseUnifiedDiff(PATCH, 1, 1);

const meta = {
  title: "Ai Ui/File Diff",
  component: FileDiff,
  tags: ["autodocs"],
  args: { file: "src/auth/login.test.ts", rows },
  decorators: [(Story) => <div className="max-w-2xl"><Story /></div>],
} satisfies Meta<typeof FileDiff>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function ReviewDemo() {
  const [status, setStatus] = useState<DiffReviewStatus>("pending");
  return (
    <div className="flex flex-col items-start gap-3">
      <FileDiff
        file="src/auth/login.test.ts"
        rows={rows}
        status={status}
        onAccept={() => setStatus("accepted")}
        onReject={() => setStatus("rejected")}
        className="w-full"
      />
      {status !== "pending" ? (
        <button
          type="button"
          className="rounded-full border border-gousse-line px-3 py-1 text-xs text-gousse-muted hover:text-gousse-ink"
          onClick={() => setStatus("pending")}
        >
          Reset
        </button>
      ) : null}
    </div>
  );
}

export const PendingReview: Story = { render: () => <ReviewDemo /> };
export const Accepted: Story = { args: { status: "accepted" } };
export const Rejected: Story = { args: { status: "rejected" } };
export const Collapsed: Story = { args: { defaultOpen: false } };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <FileDiff file="src/auth/login.test.ts" rows={rows} />
      <FileDiff file="src/auth/login.test.ts" rows={rows} status="pending" onAccept={() => {}} onReject={() => {}} />
      <FileDiff file="src/auth/login.test.ts" rows={rows} status="accepted" defaultOpen={false} />
      <FileDiff file="src/auth/login.test.ts" rows={rows} status="rejected" defaultOpen={false} />
    </div>
  ),
};
