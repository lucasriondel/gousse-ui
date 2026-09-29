import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComparisonTable, type ComparisonFeature, type ComparisonOption } from "./comparison-table.js";

const OPTIONS: ComparisonOption[] = [
  { key: "personal", label: "Personal", sub: "$0 / mo" },
  { key: "team", label: "Team", sub: "$20 / seat" },
  { key: "enterprise", label: "Enterprise", sub: "Custom" },
];

const FEATURES: ComparisonFeature[] = [
  { label: "Unlimited chats", values: { personal: true, team: true, enterprise: true } },
  { label: "Shared projects", values: { personal: false, team: true, enterprise: true } },
  { label: "SSO / SCIM", values: { personal: false, team: false, enterprise: true } },
  { label: "Audit logs", values: { personal: false, team: false, enterprise: true } },
];

const MIXED: ComparisonFeature[] = [
  { label: "Storage", values: { personal: "5 GB", team: "100 GB", enterprise: "Unlimited" } },
  { label: "Agent runs / day", values: { personal: "20", team: "500", enterprise: "Unlimited" } },
  { label: "Custom tools", values: { personal: false, team: "Beta", enterprise: true } },
  { label: "Priority support", values: { personal: false, team: true, enterprise: true } },
];

const meta = {
  title: "Ai Ui/Comparison Table",
  component: ComparisonTable,
  tags: ["autodocs"],
  args: { options: OPTIONS, features: FEATURES, caption: "Plans" },
  decorators: [(Story) => <div className="max-w-2xl">{Story()}</div>],
} satisfies Meta<typeof ComparisonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Highlighted: Story = { args: { highlight: "team" } };
export const MixedValues: Story = { args: { features: MIXED, highlight: "team" } };

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <ComparisonTable options={OPTIONS} features={FEATURES} caption="Default" />
      <ComparisonTable options={OPTIONS} features={FEATURES} highlight="team" caption="Highlighted" />
      <ComparisonTable options={OPTIONS} features={MIXED} highlight="enterprise" caption="Mixed values" />
    </div>
  ),
};
