import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bot } from "lucide-react";
import { ProviderMark, KNOWN_PROVIDER_MARKS } from "./provider-mark.js";

const LABELS: Record<string, string> = {
  "claude-code": "Claude Code",
  anthropic: "Anthropic",
  google: "Google",
  openai: "OpenAI",
};

const meta = {
  title: "Primitives/ProviderMark",
  component: ProviderMark,
  tags: ["autodocs"],
  args: { provider: "anthropic", label: "Anthropic" },
  argTypes: { provider: { control: "select", options: KNOWN_PROVIDER_MARKS } },
  parameters: { layout: "centered" },
} satisfies Meta<typeof ProviderMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Anthropic: Story = { args: { provider: "anthropic", label: "Anthropic" } };

/** The one mark that keeps its own colours — a single-tone G is unreadable. */
export const Google: Story = { args: { provider: "google", label: "Google" } };

export const OpenAI: Story = { args: { provider: "openai", label: "OpenAI" } };

/** Tinted with Claude's own orange rather than the ink token. */
export const ClaudeCode: Story = { args: { provider: "claude-code", label: "Claude Code" } };

/** An id gousse doesn't draw, with a supplied glyph. */
export const CustomIcon: Story = {
  args: {
    provider: "mistral",
    label: "Mistral",
    icon: <Bot size={18} aria-hidden />,
  },
};

/** An unknown id with no `icon` — falls back to the label's first letter. */
export const UnknownFallback: Story = {
  args: { provider: "some-vendor", label: "Some Vendor" },
};

/** `className` merges last, so the box can be resized at the call site. */
export const Large: Story = {
  args: { provider: "openai", label: "OpenAI", className: "size-12 rounded-2xl" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      {KNOWN_PROVIDER_MARKS.map((id) => (
        <div key={id} className="flex flex-col items-center gap-1.5">
          <ProviderMark provider={id} label={LABELS[id]} />
          <span className="text-[11px] text-gousse-muted">{LABELS[id]}</span>
        </div>
      ))}
      <div className="flex flex-col items-center gap-1.5">
        <ProviderMark provider="mistral" label="Mistral" icon={<Bot size={18} aria-hidden />} />
        <span className="text-[11px] text-gousse-muted">icon</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <ProviderMark provider="unknown" label="Zeta" />
        <span className="text-[11px] text-gousse-muted">fallback</span>
      </div>
    </div>
  ),
};
