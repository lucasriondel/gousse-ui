import type { Meta, StoryObj } from "@storybook/react-vite";
import { Orb, ORB_VARIANTS } from "./orb.js";

const meta = {
  title: "Ai Ui/Orb",
  component: Orb,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ORB_VARIANTS },
    size: { control: { type: "range", min: 12, max: 96, step: 2 } },
    pill: { control: "boolean" },
  },
} satisfies Meta<typeof Orb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "lattice-wave", size: 32 } };

export const Pill: Story = { args: { variant: "ring-comet", pill: true, label: "Thinking" } };

export const Tinted: Story = {
  args: { variant: "ring-chase", size: 32, className: "text-gousse-accent" },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {[16, 20, 32, 48, 72].map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Orb variant="lattice-sweep" size={size} />
          <span className="text-xs text-gousse-muted">{size}px</span>
        </div>
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
        {ORB_VARIANTS.map((v) => (
          <div key={v} className="flex flex-col items-center gap-3">
            <Orb variant={v} size={40} label={v} />
            <span className="font-mono text-[11px] text-gousse-muted">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ORB_VARIANTS.map((v) => (
          <Orb key={v} variant={v} pill label={v} className="text-gousse-accent" />
        ))}
      </div>
    </div>
  ),
};
