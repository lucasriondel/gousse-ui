import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, type DataTableColumn } from "./data-table.js";

interface ModelRow {
  model: string;
  vendor: string;
  context: number;
  price: number;
}

const ROWS: ModelRow[] = [
  { model: "claude-opus-5-5", vendor: "Anthropic", context: 1_000_000, price: 15 },
  { model: "claude-sonnet-5", vendor: "Anthropic", context: 1_000_000, price: 3 },
  { model: "claude-haiku-4-5", vendor: "Anthropic", context: 200_000, price: 1 },
  { model: "local-llama-70b", vendor: "Self-hosted", context: 128_000, price: 0 },
];

const COLUMNS: DataTableColumn<ModelRow>[] = [
  {
    key: "model",
    header: "Model",
    sortable: true,
    cell: (r) => (
      <span className="flex items-center gap-2">
        <span className="size-2 shrink-0 rounded-full bg-gousse-accent" />
        <span className="font-medium">{r.model}</span>
      </span>
    ),
  },
  { key: "vendor", header: "Vendor", sortable: true },
  {
    key: "context",
    header: "Context",
    align: "right",
    sortValue: (r) => r.context,
    cell: (r) => (r.context >= 1_000_000 ? `${r.context / 1_000_000}M` : `${r.context / 1000}K`),
  },
  {
    key: "price",
    header: "$/1M in",
    align: "right",
    sortValue: (r) => r.price,
    cell: (r) => (r.price === 0 ? "—" : `$${r.price.toFixed(2)}`),
  },
];

const meta: Meta = {
  title: "Ai Ui/Data Table",
  component: DataTable,
  tags: ["autodocs"],
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} rowKey={(r) => r.model} />,
};

export const WithCaption: Story = {
  render: () => <DataTable columns={COLUMNS} rows={ROWS} caption="Available models" />,
};

export const Loading: Story = {
  render: () => <DataTable columns={COLUMNS} rows={[]} loading />,
};

export const Empty: Story = {
  render: () => <DataTable columns={COLUMNS} rows={[]} empty="No models match this filter" />,
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <DataTable columns={COLUMNS} rows={ROWS} caption="Default" />
      <DataTable columns={COLUMNS} rows={[]} loading caption="Loading" />
      <DataTable columns={COLUMNS} rows={[]} caption="Empty" />
    </div>
  ),
};
