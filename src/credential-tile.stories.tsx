import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CredentialTile, CredentialGrid, CredentialStatusPill } from "./credential-tile.js";

const meta = {
  title: "Primitives/CredentialTile",
  component: CredentialTile,
  tags: ["autodocs"],
  args: {
    provider: "anthropic",
    label: "Anthropic",
    kind: "API key",
    placeholder: "sk-ant-…",
    submitLabel: "Save API key",
    clearLabel: "Clear API key",
    footnote: "console.anthropic.com",
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CredentialTile>;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="max-w-[320px]">{children}</div>
);

/** No key stored: hollow pill, the field, and where to get one. */
export const Unset: Story = {
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** A draft typed — the stacked button appears. */
export const Typing: Story = {
  args: { draft: "sk-ant-api03-example" },
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** Mid-save: the field locks. */
export const Saving: Story = {
  args: { draft: "sk-ant-api03-example", saving: true },
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** Stored: green border, masked hint, and a way to remove it. */
export const Configured: Story = {
  args: { configured: true, hint: "sk-ant…9f2", onClear: () => {} },
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** Removal in flight. */
export const Clearing: Story = {
  args: { configured: true, hint: "sk-ant…9f2", clearing: true, onClear: () => {} },
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** Rejected by the vendor — the border turns before the message is read. */
export const WithError: Story = {
  args: { draft: "sk-ant-nope", error: "That key was rejected by Anthropic (401)." },
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** Status still being fetched: spinner in the pill's place, empty value slot. */
export const Loading: Story = {
  args: { loading: true },
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** A provider with no mark of its own, falling back to its initial. */
export const UnknownProvider: Story = {
  args: { provider: "some-vendor", label: "Some Vendor", footnote: "vendor.example" },
  render: (args) => (
    <Frame>
      <CredentialTile {...args} />
    </Frame>
  ),
};

/** The grid: four providers, 2×2 from `sm` up. */
export const Grid: Story = {
  render: function GridStory() {
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [stored, setStored] = useState<Record<string, string>>({
      "claude-code": "sk-ant-oat…c14",
    });

    const providers = [
      {
        id: "claude-code",
        label: "Claude Code",
        kind: "OAuth token",
        placeholder: "sk-ant-oat…",
        footnote: "Run `claude setup-token`",
      },
      {
        id: "anthropic",
        label: "Anthropic",
        kind: "API key",
        placeholder: "sk-ant-…",
        footnote: "console.anthropic.com",
      },
      {
        id: "google",
        label: "Google",
        kind: "API key",
        placeholder: "AIza…",
        footnote: "aistudio.google.com",
      },
      {
        id: "openai",
        label: "OpenAI",
        kind: "API key",
        placeholder: "sk-…",
        footnote: "platform.openai.com",
      },
    ];

    return (
      <div className="flex max-w-2xl flex-col gap-3">
        <CredentialGrid>
          {providers.map((p) => (
            <CredentialTile
              key={p.id}
              provider={p.id}
              label={p.label}
              kind={p.kind}
              placeholder={p.placeholder}
              footnote={p.footnote}
              submitLabel="Save"
              clearLabel="Clear"
              configured={Boolean(stored[p.id])}
              hint={stored[p.id]}
              draft={drafts[p.id] ?? ""}
              onDraftChange={(value) => setDrafts((d) => ({ ...d, [p.id]: value }))}
              onSave={() => {
                const value = drafts[p.id] ?? "";
                setStored((s) => ({ ...s, [p.id]: `${value.slice(0, 6)}…${value.slice(-3)}` }));
                setDrafts((d) => ({ ...d, [p.id]: "" }));
              }}
              onClear={() =>
                setStored((s) => {
                  const next = { ...s };
                  delete next[p.id];
                  return next;
                })
              }
            />
          ))}
        </CredentialGrid>
        <p className="px-1 text-xs text-gousse-muted">
          Each credential is sent once and stored encrypted on the server. It is never shown
          again — only the first characters and the last three.
        </p>
      </div>
    );
  },
};

/** The pill on its own, both states. Shape differs as well as hue. */
export const StatusPills: Story = {
  render: () => (
    <div className="flex gap-3">
      <CredentialStatusPill configured />
      <CredentialStatusPill configured={false} />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <CredentialGrid className="max-w-2xl">
      <CredentialTile
        provider="anthropic"
        label="Anthropic"
        kind="API key"
        placeholder="sk-ant-…"
        footnote="console.anthropic.com"
        submitLabel="Save"
      />
      <CredentialTile
        provider="openai"
        label="OpenAI"
        kind="API key"
        configured
        hint="sk-…a41"
        onClear={() => {}}
      />
      <CredentialTile
        provider="google"
        label="Google"
        kind="API key"
        draft="AIza-bad"
        error="That key was rejected (400)."
        submitLabel="Save"
      />
      <CredentialTile provider="claude-code" label="Claude Code" kind="OAuth token" loading />
    </CredentialGrid>
  ),
};
