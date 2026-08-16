import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ModelRow } from "./model-row.js";
import { SettingsCard } from "./setting-row.js";
import { SecretField } from "./secret-field.js";

const PROVIDERS = [
  { id: "claude-code", label: "Claude Code" },
  { id: "anthropic", label: "Anthropic" },
  { id: "google", label: "Google" },
  { id: "openai", label: "OpenAI" },
];

const MODELS: Record<string, { id: string; label: string }[]> = {
  "claude-code": [
    { id: "claude-opus-5", label: "Claude Opus 5" },
    { id: "claude-sonnet-5", label: "Claude Sonnet 5" },
  ],
  anthropic: [
    { id: "claude-opus-5", label: "Claude Opus 5" },
    { id: "claude-sonnet-5", label: "Claude Sonnet 5" },
    { id: "claude-haiku-4-5", label: "Claude Haiku 4.5" },
  ],
  google: [{ id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" }],
  openai: [{ id: "gpt-5", label: "GPT-5" }],
};

const meta = {
  title: "Primitives/ModelRow",
  component: ModelRow,
  tags: ["autodocs"],
  args: {
    title: "Triage",
    description: "Classifies priority and suggests labels in each sync batch.",
    provider: "anthropic",
    providers: PROVIDERS,
    model: "claude-sonnet-5",
    models: MODELS.anthropic,
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ModelRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const Card = ({ children }: { children: React.ReactNode }) => (
  <SettingsCard className="max-w-3xl">{children}</SettingsCard>
);

/** At rest — two selects, no status. */
export const Default: Story = {
  render: (args) => (
    <Card>
      <ModelRow {...args} />
    </Card>
  ),
};

/** Mid-save: both selects lock and the tick spins. */
export const Saving: Story = {
  args: { saving: true },
  render: (args) => (
    <Card>
      <ModelRow {...args} />
    </Card>
  ),
};

/** Saved — the tick sits beside the control that changed. */
export const Saved: Story = {
  args: { saved: true },
  render: (args) => (
    <Card>
      <ModelRow {...args} />
    </Card>
  ),
};

/** The save failed. The message replaces the tick rather than raising a toast. */
export const Failed: Story = {
  args: { error: "Could not reach the server." },
  render: (args) => (
    <Card>
      <ModelRow {...args} />
    </Card>
  ),
};

/** Disabled while the provider roster is still loading. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Card>
      <ModelRow {...args} />
    </Card>
  ),
};

/** One provider offered — no key stored for the others yet. */
export const SingleProvider: Story = {
  args: {
    provider: "claude-code",
    providers: [{ id: "claude-code", label: "Claude Code" }],
    model: "claude-opus-5",
    models: MODELS["claude-code"],
  },
  render: (args) => (
    <Card>
      <ModelRow {...args} />
    </Card>
  ),
};

/**
 * The chosen provider has no key: the row grows a field underneath and
 * top-aligns itself so the selects stay level with the title.
 */
export const MissingKey: Story = {
  render: (args) => (
    <Card>
      <ModelRow {...args}>
        <SecretField
          value=""
          onChange={() => {}}
          onSubmit={() => {}}
          label="Anthropic API key"
          placeholder="sk-ant-…"
          submitLabel="Save Anthropic key"
        />
      </ModelRow>
    </Card>
  ),
};

/**
 * Drive it: changing the provider resets the model to that provider's first,
 * which is what a server echoing back its default does.
 */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [provider, setProvider] = useState("anthropic");
    const [model, setModel] = useState("claude-sonnet-5");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const persist = (next: () => void) => {
      next();
      setSaved(false);
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        setSaved(true);
      }, 700);
    };

    return (
      <Card>
        <ModelRow
          title="Triage"
          description="Classifies priority and suggests labels in each sync batch."
          provider={provider}
          providers={PROVIDERS}
          model={model}
          models={MODELS[provider] ?? []}
          saving={saving}
          saved={saved}
          onProviderChange={(next) =>
            persist(() => {
              setProvider(next);
              setModel(MODELS[next]?.[0]?.id ?? "");
            })
          }
          onModelChange={(next) => persist(() => setModel(next))}
        />
      </Card>
    );
  },
};

/** A card of them — the shape a settings page takes. */
export const AllStates: Story = {
  render: () => (
    <Card>
      <ModelRow
        title="Triage"
        description="Classifies priority and suggests labels in each sync batch."
        provider="anthropic"
        providers={PROVIDERS}
        model="claude-sonnet-5"
        models={MODELS.anthropic}
      />
      <ModelRow
        title="Filter"
        description="Proposes filters from each synced batch."
        provider="google"
        providers={PROVIDERS}
        model="gemini-2.5-pro"
        models={MODELS.google}
        saving
      />
      <ModelRow
        title="Reply"
        description="Generates a draft when you click Generate."
        provider="openai"
        providers={PROVIDERS}
        model="gpt-5"
        models={MODELS.openai}
        saved
      />
      <ModelRow
        title="Summaries"
        description="Condenses a thread on demand."
        provider="claude-code"
        providers={PROVIDERS}
        model="claude-opus-5"
        models={MODELS["claude-code"]}
        error="Could not reach the server."
      />
    </Card>
  ),
};
