import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Clock, Trash2 } from "lucide-react";
import { SettingsCard, SettingRow } from "./setting-row.js";
import { Switch } from "./switch.js";
import { Select } from "./select.js";
import { Button } from "./button.js";
import { SecretField } from "./secret-field.js";
import { Notice } from "./notice.js";

const meta = {
  title: "Primitives/SettingRow",
  component: SettingRow,
  tags: ["autodocs"],
  args: { title: "Weekly digest", description: "A Monday summary of last week." },
  argTypes: { alignTop: { control: "boolean" } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof SettingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

const Card = ({ children }: { children: React.ReactNode }) => (
  <SettingsCard className="max-w-2xl">{children}</SettingsCard>
);

/** Title and description only — a row that states rather than offers. */
export const TextOnly: Story = {
  render: (args) => (
    <Card>
      <SettingRow {...args} />
    </Card>
  ),
};

/** Title alone, no description. The row shrinks to one line. */
export const TitleOnly: Story = {
  args: { description: undefined },
  render: (args) => (
    <Card>
      <SettingRow {...args} />
    </Card>
  ),
};

/** With a control on the right — the common case. */
export const WithControl: Story = {
  render: function WithControlStory(args) {
    const [on, setOn] = useState(true);
    return (
      <Card>
        <SettingRow
          {...args}
          control={<Switch aria-label="Weekly digest" checked={on} onCheckedChange={setOn} />}
        />
      </Card>
    );
  },
};

/** A leading slot — icon, avatar or provider mark before the text. */
export const WithLeading: Story = {
  render: (args) => (
    <Card>
      <SettingRow
        {...args}
        leading={
          <span className="grid size-[30px] place-items-center rounded-[9px] bg-gousse-ink/5 text-gousse-ink dark:bg-gousse-ink/10">
            <Bell size={16} aria-hidden />
          </span>
        }
        control={<Switch aria-label="Weekly digest" checked onCheckedChange={() => {}} />}
      />
    </Card>
  ),
};

/** `children` unfolds under the description, full width. */
export const WithUnfoldedField: Story = {
  args: { title: "Anthropic", description: "No key stored yet.", alignTop: true },
  render: (args) => (
    <Card>
      <SettingRow
        {...args}
        control={
          <Select aria-label="Provider" defaultValue="anthropic" className="w-40">
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
          </Select>
        }
      >
        <SecretField
          value="sk-ant-"
          onChange={() => {}}
          onSubmit={() => {}}
          label="Anthropic API key"
          placeholder="sk-ant-…"
          submitLabel="Save Anthropic key"
        />
      </SettingRow>
    </Card>
  ),
};

/** `alignTop` off vs on, with a tall row — the control's tie to the title. */
export const Alignment: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card>
        <SettingRow
          title="Centred (default)"
          description="The control drifts to the middle of a grown row."
          control={<Button>Action</Button>}
        >
          <Notice variant="info" className="mt-2">
            A block that makes this row tall.
          </Notice>
        </SettingRow>
      </Card>
      <Card>
        <SettingRow
          alignTop
          title="Top-aligned"
          description="The control stays level with the title."
          control={<Button>Action</Button>}
        >
          <Notice variant="info" className="mt-2">
            A block that makes this row tall.
          </Notice>
        </SettingRow>
      </Card>
    </div>
  ),
};

/** A stack — the card draws the dividers, not the rows. */
export const Stacked: Story = {
  render: function StackedStory() {
    const [digest, setDigest] = useState(true);
    const [alerts, setAlerts] = useState(false);

    return (
      <Card>
        <SettingRow
          leading={
            <span className="grid size-[30px] place-items-center rounded-[9px] bg-gousse-ink/5 text-gousse-ink dark:bg-gousse-ink/10">
              <Bell size={16} aria-hidden />
            </span>
          }
          title="Weekly digest"
          description="A Monday summary of everything triaged last week."
          control={
            <Switch aria-label="Weekly digest" checked={digest} onCheckedChange={setDigest} />
          }
        />
        <SettingRow
          leading={
            <span className="grid size-[30px] place-items-center rounded-[9px] bg-gousse-ink/5 text-gousse-ink dark:bg-gousse-ink/10">
              <Clock size={16} aria-hidden />
            </span>
          }
          title="Sync interval"
          description="How often the mailbox is polled."
          control={
            <Select aria-label="Sync interval" defaultValue="15" className="w-40">
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="60">Hourly</option>
            </Select>
          }
        />
        <SettingRow
          leading={
            <span className="grid size-[30px] place-items-center rounded-[9px] bg-gousse-high/10 text-gousse-high">
              <Trash2 size={16} aria-hidden />
            </span>
          }
          title="Delete everything"
          description="Removes the workspace and its history."
          control={<Button variant="danger">Delete</Button>}
        />
        <SettingRow
          title="Instant alerts"
          description="A push the moment something urgent lands."
          control={
            <Switch aria-label="Instant alerts" checked={alerts} onCheckedChange={setAlerts} />
          }
        />
      </Card>
    );
  },
};
