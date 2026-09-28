import type { Meta, StoryObj } from "@storybook/react-vite";
import { RainbowGlow } from "./rainbow-glow.js";

const meta = {
  title: "Effects/RainbowGlow",
  component: RainbowGlow,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    variant: { control: "inline-radio", options: ["pill", "card"] },
    trigger: { control: "inline-radio", options: ["hover", "always"] },
    active: { control: "boolean" },
  },
} satisfies Meta<typeof RainbowGlow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Pill halo — hover the button to spin it up. */
export const PillOnHover: Story = {
  args: { variant: "pill", trigger: "hover" },
  render: (args) => (
    <button
      type="button"
      className="group relative isolate inline-flex items-center rounded-full"
    >
      <RainbowGlow {...args} />
      <span className="relative z-[1] m-0.5 rounded-full bg-gousse-accent/[0.12] px-3 py-2 text-[13px] font-bold text-gousse-accent group-hover:bg-gousse-panel group-hover:text-gousse-ink group-hover:shadow-gousse-sm">
        ✦ Triage
      </span>
    </button>
  ),
};

/** Active (e.g. a run in progress) — lit + spinning without hover. */
export const PillActive: Story = {
  args: { variant: "pill", active: true },
  render: (args) => (
    <span className="relative isolate inline-flex items-center rounded-full">
      <RainbowGlow {...args} />
      <span className="relative z-[1] m-0.5 rounded-full bg-gousse-panel px-3 py-2 text-[13px] font-bold text-gousse-ink shadow-gousse-sm">
        ✦ Triaging…
      </span>
    </span>
  ),
};

/** Card halo — permanently lit, squared to a card radius. */
export const Card: Story = {
  args: { variant: "card", trigger: "always" },
  render: (args) => (
    <div className="relative w-80 rounded-[22px]">
      <RainbowGlow {...args} />
      <div className="relative z-[1] rounded-[20px] bg-gousse-panel px-5 py-4 shadow-gousse-md">
        <p className="text-sm font-bold text-gousse-ink">Proposed by Claude</p>
        <p className="mt-1 text-xs text-gousse-muted">3 filters waiting for review.</p>
      </div>
    </div>
  ),
};

/**
 * Tall card — the case that used to break. The halo's rotating square is sized
 * off the host's larger side, so a long list is lit edge to edge instead of
 * only across a band in the middle.
 */
export const TallCard: Story = {
  args: { variant: "card", trigger: "always" },
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="relative w-[560px] rounded-md">
      <RainbowGlow {...args} className="!rounded-[9px]" />
      <div className="relative z-[1] overflow-hidden rounded-md border border-gousse-line bg-gousse-panel">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-gousse-line px-4 py-3 last:border-b-0"
          >
            <span className="w-40 shrink-0 truncate text-sm font-bold text-gousse-ink">
              Sender {i + 1}
            </span>
            <span className="truncate text-sm text-gousse-muted">
              A subject line long enough to fill the row
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

/**
 * Wide card — the mirror of `TallCard`. Sizing off the larger side must not
 * leave a short, very wide host under-covered either.
 */
export const WideCard: Story = {
  args: { variant: "card", trigger: "always" },
  parameters: { layout: "padded" },
  render: (args) => (
    <div className="relative w-[900px] rounded-md">
      <RainbowGlow {...args} className="!rounded-[9px]" />
      <div className="relative z-[1] rounded-md border border-gousse-line bg-gousse-panel px-5 py-4">
        <p className="text-sm font-bold text-gousse-ink">One wide row</p>
      </div>
    </div>
  ),
};
