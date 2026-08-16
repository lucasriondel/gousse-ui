import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SecretField } from "./secret-field.js";

const meta = {
  title: "Primitives/SecretField",
  component: SecretField,
  tags: ["autodocs"],
  args: {
    value: "",
    onChange: () => {},
    onSubmit: () => {},
    label: "Anthropic API key",
    placeholder: "sk-ant-…",
    submitLabel: "Save key",
    pending: false,
    layout: "row",
  },
  argTypes: { layout: { control: "inline-radio", options: ["row", "stacked"] } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SecretField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty row layout — the button is present but refuses an empty submit. */
export const Empty: Story = {};

/** With a draft typed. Masked, monospaced, and the button is live. */
export const Filled: Story = { args: { value: "sk-ant-api03-abcdef" } };

/** Mid-request: the input locks and the button greys out. */
export const Pending: Story = { args: { value: "sk-ant-api03-abcdef", pending: true } };

/** The server refused it. The message sits under the field, not in a toast. */
export const WithError: Story = {
  args: {
    value: "sk-ant-nope",
    error: "That key was rejected by Anthropic (401).",
  },
};

/** Stacked, empty — the button stays hidden until there is something to save. */
export const StackedEmpty: Story = { args: { layout: "stacked" } };

/** Stacked with a draft — the button appears full-width under the input. */
export const StackedFilled: Story = {
  args: { layout: "stacked", value: "AIzaSyB-example", submitLabel: "Save API key" },
};

/** Type in it: draft state, submit, pending, then a masked hint. */
export const Interactive: Story = {
  render: function InteractiveStory() {
    const [value, setValue] = useState("");
    const [pending, setPending] = useState(false);
    const [stored, setStored] = useState<string | null>(null);

    if (stored) {
      return (
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-gousse-ink">{stored}</span>
          <button
            className="text-xs text-gousse-muted underline"
            onClick={() => setStored(null)}
          >
            reset
          </button>
        </div>
      );
    }

    return (
      <SecretField
        value={value}
        onChange={setValue}
        onSubmit={() => {
          setPending(true);
          setTimeout(() => {
            setPending(false);
            setStored(`${value.slice(0, 6)}…${value.slice(-3)}`);
            setValue("");
          }, 900);
        }}
        label="Anthropic API key"
        placeholder="sk-ant-…"
        submitLabel="Save key"
        pending={pending}
      />
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex max-w-xl flex-col gap-6">
      <SecretField
        value=""
        onChange={() => {}}
        onSubmit={() => {}}
        label="Key"
        placeholder="sk-…"
        submitLabel="Save key"
      />
      <SecretField
        value="sk-example-value"
        onChange={() => {}}
        onSubmit={() => {}}
        label="Key"
        submitLabel="Save key"
      />
      <SecretField
        value="sk-example-value"
        onChange={() => {}}
        onSubmit={() => {}}
        label="Key"
        submitLabel="Save key"
        pending
      />
      <SecretField
        value="sk-bad"
        onChange={() => {}}
        onSubmit={() => {}}
        label="Key"
        submitLabel="Save key"
        error="That key was rejected (401)."
      />
      <div className="max-w-[240px]">
        <SecretField
          layout="stacked"
          value="sk-example-value"
          onChange={() => {}}
          onSubmit={() => {}}
          label="Key"
          submitLabel="Save key"
        />
      </div>
    </div>
  ),
};
