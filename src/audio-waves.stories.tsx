import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AudioWaves, type AudioWavesVariant } from "./audio-waves.js";

const meta = {
  title: "Ai Ui/Audio Waves",
  component: AudioWaves,
  tags: ["autodocs"],
  args: { height: 32, className: "text-gousse-ink" },
  argTypes: {
    variant: { control: "inline-radio", options: ["bars", "mirrored", "dots", "line", "rings"] },
    state: { control: "inline-radio", options: ["active", "idle"] },
  },
} satisfies Meta<typeof AudioWaves>;

export default meta;
type Story = StoryObj<typeof meta>;

const VARIANTS: AudioWavesVariant[] = ["bars", "mirrored", "dots", "line", "rings"];

export const Bars: Story = { args: { variant: "bars" } };
export const Mirrored: Story = { args: { variant: "mirrored", count: 16 } };
export const Dots: Story = { args: { variant: "dots" } };
export const Line: Story = { args: { variant: "line" } };
export const Rings: Story = { args: { variant: "rings", height: 48 } };
export const Idle: Story = { args: { variant: "bars", state: "idle" } };

function LiveDemo({ count = 24 }: { count?: number }) {
  const [levels, setLevels] = useState<number[]>(() => Array(count).fill(0.1));
  useEffect(() => {
    const id = setInterval(() => {
      const loud = 0.3 + Math.random() * 0.7;
      setLevels(Array.from({ length: count }, () => Math.random() * loud));
    }, 90);
    return () => clearInterval(id);
  }, [count]);
  return (
    <div className="flex max-w-xl flex-col gap-2">
      <AudioWaves variant="mirrored" count={count} height={40} levels={levels} className="text-gousse-accent" />
      <span className="text-xs text-gousse-muted">Levels from a simulated mic (random, 90ms frames)</span>
    </div>
  );
}

export const Live: Story = { render: () => <LiveDemo /> };

export const AllVariants: Story = {
  render: () => (
    <div className="grid max-w-xl grid-cols-[auto_1fr_1fr] items-center gap-x-8 gap-y-6">
      <span />
      <span className="text-xs font-medium text-gousse-muted">active</span>
      <span className="text-xs font-medium text-gousse-muted">idle</span>
      {VARIANTS.map((v) => (
        <div key={v} className="contents">
          <span className="font-mono text-xs text-gousse-muted">{v}</span>
          <AudioWaves variant={v} height={32} className="text-gousse-ink" />
          <AudioWaves variant={v} height={32} state="idle" className="text-gousse-muted" />
        </div>
      ))}
    </div>
  ),
};
