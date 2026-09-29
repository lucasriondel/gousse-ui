import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { FileText, Image, Link } from "lucide-react";
import { AgentInput, type AgentAttachment, type AgentModel } from "./agent-input.js";
import { DropdownMenuItem } from "./dropdown-menu.js";

const MODELS: AgentModel[] = [
  { id: "opus", label: "Opus 5.5", description: "Most capable" },
  { id: "sonnet", label: "Sonnet 5", description: "Fast and smart" },
  { id: "haiku", label: "Haiku 4.5", description: "Fastest" },
];

const ATTACH_MENU = (
  <>
    <DropdownMenuItem>
      <FileText size={14} /> Upload file
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Image size={14} /> Add image
    </DropdownMenuItem>
    <DropdownMenuItem>
      <Link size={14} /> Paste link
    </DropdownMenuItem>
  </>
);

const ATTACHMENTS: AgentAttachment[] = [
  { id: "a", name: "build-log.txt" },
  { id: "b", name: "tsconfig.json" },
];

const noop = () => {};
const FILLED = "Why does the dist build fail to load under Node?";
const ENHANCED =
  "Investigate why the compiled dist/ output fails under Node's ESM resolver: check relative import specifiers for missing .js extensions, confirm the tsconfig moduleResolution setting, and propose a fix.";

function useLevels(run: boolean) {
  const [levels, setLevels] = useState<number[]>([]);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(
      () => setLevels(Array.from({ length: 24 }, () => 0.15 + Math.random() * 0.85)),
      90,
    );
    return () => clearInterval(id);
  }, [run]);
  return levels;
}

function Recording() {
  const levels = useLevels(true);
  return (
    <AgentInput
      recording
      levels={levels}
      onToggleRecording={noop}
      models={MODELS}
      model="opus"
      attachMenu={ATTACH_MENU}
    />
  );
}

function Interactive() {
  const [value, setValue] = useState("");
  const [before, setBefore] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [running, setRunning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [model, setModel] = useState("opus");
  const [attachments, setAttachments] = useState<AgentAttachment[]>(ATTACHMENTS);
  const [sent, setSent] = useState<string[]>([]);
  const levels = useLevels(recording);

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(() => setRunning(false), 2000);
    return () => clearTimeout(id);
  }, [running]);

  return (
    <div className="flex flex-col gap-3">
      {sent.map((s, i) => (
        <p key={i} className="self-end rounded-2xl bg-gousse-line/50 px-3 py-2 text-sm">
          {s}
        </p>
      ))}
      <AgentInput
        value={value}
        onValueChange={(v) => {
          setValue(v);
          setBefore(null);
        }}
        onSubmit={(v) => {
          setSent((s) => [...s, v]);
          setValue("");
          setBefore(null);
          setRunning(true);
        }}
        running={running}
        onStop={() => setRunning(false)}
        onEnhance={() => {
          setEnhancing(true);
          setTimeout(() => {
            setBefore(value);
            setValue(ENHANCED);
            setEnhancing(false);
          }, 1500);
        }}
        enhancing={enhancing}
        enhanced={before !== null}
        onUndoEnhance={() => {
          setValue(before ?? "");
          setBefore(null);
        }}
        models={MODELS}
        model={model}
        onModelChange={setModel}
        attachMenu={ATTACH_MENU}
        attachments={attachments}
        onRemoveAttachment={(id) => setAttachments((a) => a.filter((x) => x.id !== id))}
        recording={recording}
        onToggleRecording={() => setRecording((r) => !r)}
        levels={levels}
      />
    </div>
  );
}

const meta = {
  title: "Ai Ui/Agent Input",
  component: AgentInput,
  tags: ["autodocs"],
  args: {
    models: MODELS,
    model: "opus",
    attachMenu: ATTACH_MENU,
    onEnhance: noop,
    onToggleRecording: noop,
    onSubmit: noop,
  },
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
} satisfies Meta<typeof AgentInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};
export const Filled: Story = { args: { defaultValue: FILLED } };
export const Enhancing: Story = { args: { value: FILLED, enhancing: true } };
export const Enhanced: Story = {
  args: { value: ENHANCED, enhanced: true, onUndoEnhance: noop },
};
export const Running: Story = { args: { running: true, onStop: noop } };
export const RecordingLive: Story = { render: () => <Recording /> };
export const WithAttachments: Story = {
  args: { attachments: ATTACHMENTS, onRemoveAttachment: noop, defaultValue: FILLED },
};
export const Disabled: Story = { args: { disabled: true } };
export const Minimal: Story = {
  args: {
    models: undefined,
    attachMenu: undefined,
    onEnhance: undefined,
    onToggleRecording: undefined,
  },
};
export const InteractiveDemo: Story = { render: () => <Interactive /> };

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AgentInput models={MODELS} attachMenu={ATTACH_MENU} onEnhance={noop} onToggleRecording={noop} />
      <AgentInput defaultValue={FILLED} models={MODELS} onEnhance={noop} />
      <AgentInput value={FILLED} enhancing models={MODELS} onEnhance={noop} />
      <AgentInput value={ENHANCED} enhanced onUndoEnhance={noop} models={MODELS} onEnhance={noop} />
      <AgentInput running onStop={noop} models={MODELS} />
      <Recording />
      <AgentInput attachments={ATTACHMENTS} onRemoveAttachment={noop} models={MODELS} />
      <AgentInput />
    </div>
  ),
};
