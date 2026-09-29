import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ImageGeneration } from "./image-generation.js";

const SRC = "https://picsum.photos/seed/gousse-lighthouse/800/800";

const meta = {
  title: "Ai Ui/Image Generation",
  component: ImageGeneration,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["generating", "done", "error"] },
    aspect: { control: "inline-radio", options: ["square", "portrait", "landscape"] },
  },
} satisfies Meta<typeof ImageGeneration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Generating: Story = { args: { status: "generating" } };

function ProgressDemo() {
  const [progress, setProgress] = useState(0);
  const done = progress >= 100;
  useEffect(() => {
    if (done) return;
    const id = setTimeout(() => setProgress((p) => Math.min(100, p + 3 + Math.random() * 6)), 200);
    return () => clearTimeout(id);
  }, [progress, done]);
  return (
    <div className="flex flex-col items-start gap-3">
      <ImageGeneration
        status={done ? "done" : "generating"}
        progress={progress}
        src={SRC}
        alt="A lighthouse on a cliff at dusk"
        caption="A lighthouse on a cliff at dusk, watercolor"
      />
      <button
        type="button"
        className="rounded-full border border-gousse-line px-3 py-1 text-xs text-gousse-muted hover:text-gousse-ink"
        onClick={() => setProgress(0)}
      >
        Regenerate
      </button>
    </div>
  );
}

export const WithProgress: Story = { render: () => <ProgressDemo /> };

export const Done: Story = {
  args: {
    status: "done",
    src: SRC,
    alt: "A lighthouse on a cliff at dusk",
    caption: "A lighthouse on a cliff at dusk, watercolor",
  },
};

export const Failed: Story = { args: { status: "error" } };

export const Square: Story = { args: { aspect: "square" } };
export const Portrait: Story = { args: { aspect: "portrait" } };
export const Landscape: Story = { args: { aspect: "landscape" } };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ImageGeneration status="generating" />
        <ImageGeneration status="generating" progress={62} />
        <ImageGeneration status="done" src={SRC} alt="A lighthouse" caption="Watercolor lighthouse" />
        <ImageGeneration status="error" />
      </div>
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-3">
        <ImageGeneration aspect="square" status="generating" />
        <ImageGeneration aspect="portrait" status="generating" />
        <ImageGeneration
          aspect="landscape"
          status="done"
          src="https://picsum.photos/seed/gousse-coast/1280/720"
          alt="A coastline"
        />
      </div>
    </div>
  ),
};
