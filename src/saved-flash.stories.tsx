import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SavedFlash } from "./saved-flash.js";
import { Switch } from "./switch.js";
import { SettingsCard, SettingRow } from "./setting-row.js";

const meta = {
  title: "Primitives/SavedFlash",
  component: SavedFlash,
  tags: ["autodocs"],
  args: { saving: false, saved: false, error: null },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SavedFlash>;

export default meta;
type Story = StoryObj<typeof meta>;

/** At rest it renders nothing — a settled row carries no leftover chrome. */
export const Idle: Story = {};

export const Saving: Story = { args: { saving: true } };

export const Saved: Story = { args: { saved: true } };

export const Failed: Story = { args: { error: "Could not reach the server." } };

/** Saving wins over saved: a second change while the first is in flight. */
export const SavingOverSaved: Story = { args: { saving: true, saved: true } };

/** In place, beside the control that changed. */
export const InARow: Story = {
  render: function InARowStory() {
    const [on, setOn] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    return (
      <SettingsCard className="max-w-xl">
        <SettingRow
          title="Weekly digest"
          description="A Monday summary of everything triaged last week."
          control={
            <>
              <Switch
                aria-label="Weekly digest"
                checked={on}
                onCheckedChange={(next) => {
                  setOn(next);
                  setSaved(false);
                  setSaving(true);
                  setTimeout(() => {
                    setSaving(false);
                    setSaved(true);
                  }, 800);
                }}
              />
              <SavedFlash saving={saving} saved={saved} error={null} />
            </>
          }
        />
      </SettingsCard>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <SavedFlash saving />
      <SavedFlash saved />
      <SavedFlash error="Could not reach the server." />
      <span className="text-xs text-gousse-muted">(idle renders nothing)</span>
      <SavedFlash />
    </div>
  ),
};
