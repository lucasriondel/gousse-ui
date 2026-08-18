import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { FileText, Receipt, Ruler } from "lucide-react";
import { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel } from "./tabs.js";

const meta = {
  title: "Primitives/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const panelClass = "pt-4 text-sm text-gousse-muted";

/** The plain strip: three tabs, uncontrolled, first one active. */
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="transactions" className="w-[34rem]">
      <TabsList>
        <TabsTab value="transactions">Transactions</TabsTab>
        <TabsTab value="rules">Rules</TabsTab>
        <TabsTab value="notes">Notes</TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="transactions" className={panelClass}>
        The rows this issuer has claimed.
      </TabsPanel>
      <TabsPanel value="rules" className={panelClass}>
        The patterns that claim incoming rows.
      </TabsPanel>
      <TabsPanel value="notes" className={panelClass}>
        Anything worth remembering about this issuer.
      </TabsPanel>
    </Tabs>
  ),
};

/** Counts and icons inside a tab — the label is free-form content. */
export const WithCountsAndIcons: Story = {
  render: () => (
    <Tabs defaultValue="transactions" className="w-[34rem]">
      <TabsList>
        <TabsTab value="transactions">
          <Receipt className="size-3.5" aria-hidden />
          Transactions
          <span className="rounded-full bg-gousse-line/60 px-1.5 text-[11px] tabular-nums text-gousse-muted">
            24
          </span>
        </TabsTab>
        <TabsTab value="rules">
          <Ruler className="size-3.5" aria-hidden />
          Rules
          <span className="rounded-full bg-gousse-line/60 px-1.5 text-[11px] tabular-nums text-gousse-muted">
            3
          </span>
        </TabsTab>
        <TabsTab value="notes">
          <FileText className="size-3.5" aria-hidden />
          Notes
        </TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="transactions" className={panelClass}>
        24 transactions.
      </TabsPanel>
      <TabsPanel value="rules" className={panelClass}>
        3 matching rules.
      </TabsPanel>
      <TabsPanel value="notes" className={panelClass}>
        No note yet.
      </TabsPanel>
    </Tabs>
  ),
};

/** A disabled tab stays rendered — it is skipped by the arrow keys. */
export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="transactions" className="w-[34rem]">
      <TabsList>
        <TabsTab value="transactions">Transactions</TabsTab>
        <TabsTab value="rules" disabled>
          Rules
        </TabsTab>
        <TabsTab value="notes">Notes</TabsTab>
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="transactions" className={panelClass}>
        Rules are disabled in this story.
      </TabsPanel>
      <TabsPanel value="notes" className={panelClass}>
        Anything worth remembering.
      </TabsPanel>
    </Tabs>
  ),
};

/**
 * Controlled — the state lives outside the strip. This is the shape a tab whose
 * value comes from the URL takes.
 */
export const Controlled: Story = {
  render: function ControlledTabs() {
    const [value, setValue] = useState<string>("rules");
    return (
      <div className="flex w-[34rem] flex-col gap-3">
        <Tabs value={value} onValueChange={(next) => setValue(next as string)}>
          <TabsList>
            <TabsTab value="transactions">Transactions</TabsTab>
            <TabsTab value="rules">Rules</TabsTab>
            <TabsTab value="notes">Notes</TabsTab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel value="transactions" className={panelClass}>
            Transactions panel.
          </TabsPanel>
          <TabsPanel value="rules" className={panelClass}>
            Rules panel.
          </TabsPanel>
          <TabsPanel value="notes" className={panelClass}>
            Notes panel.
          </TabsPanel>
        </Tabs>
        <p className="text-xs text-gousse-muted">
          Value held outside: <code className="text-gousse-ink">{value}</code>
        </p>
      </div>
    );
  },
};

/** Many tabs — the strip scrolls sideways rather than wrapping to a second row. */
export const Scrollable: Story = {
  render: () => (
    <Tabs defaultValue="one" className="w-[22rem]">
      <TabsList className="overflow-x-auto">
        {["one", "two", "three", "four", "five", "six", "seven"].map((name) => (
          <TabsTab key={name} value={name} className="capitalize">
            {name}
          </TabsTab>
        ))}
        <TabsIndicator />
      </TabsList>
      <TabsPanel value="one" className={panelClass}>
        The strip scrolls; the panel does not.
      </TabsPanel>
    </Tabs>
  ),
};

/** Every state side by side. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gousse-muted">Plain</p>
        <Tabs defaultValue="a" className="w-[30rem]">
          <TabsList>
            <TabsTab value="a">Active</TabsTab>
            <TabsTab value="b">Inactive</TabsTab>
            <TabsTab value="c" disabled>
              Disabled
            </TabsTab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel value="a" className={panelClass}>
            Panel A.
          </TabsPanel>
          <TabsPanel value="b" className={panelClass}>
            Panel B.
          </TabsPanel>
        </Tabs>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gousse-muted">
          With counts
        </p>
        <Tabs defaultValue="a" className="w-[30rem]">
          <TabsList>
            <TabsTab value="a">
              Transactions
              <span className="rounded-full bg-gousse-line/60 px-1.5 text-[11px] tabular-nums text-gousse-muted">
                24
              </span>
            </TabsTab>
            <TabsTab value="b">
              Rules
              <span className="rounded-full bg-gousse-line/60 px-1.5 text-[11px] tabular-nums text-gousse-muted">
                3
              </span>
            </TabsTab>
            <TabsIndicator />
          </TabsList>
          <TabsPanel value="a" className={panelClass}>
            Panel A.
          </TabsPanel>
          <TabsPanel value="b" className={panelClass}>
            Panel B.
          </TabsPanel>
        </Tabs>
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-gousse-muted">
          No indicator
        </p>
        <Tabs defaultValue="a" className="w-[30rem]">
          <TabsList>
            <TabsTab value="a">First</TabsTab>
            <TabsTab value="b">Second</TabsTab>
          </TabsList>
          <TabsPanel value="a" className={panelClass}>
            The strip works without the sliding underline — it cuts instead.
          </TabsPanel>
          <TabsPanel value="b" className={panelClass}>
            Panel B.
          </TabsPanel>
        </Tabs>
      </section>
    </div>
  ),
};
