import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { CopyButton } from "./copy-button.js";
import { ResponseAction, TextResponse } from "./text-response.js";

const PROSE = (
  <>
    <p>
      The build fails because <code>tsc</code> emits extensionless specifiers, and Node's ESM
      resolver does no extension guessing. There are two ways to fix it:
    </p>
    <ul>
      <li>
        Add explicit <code>.js</code> extensions to every relative import.
      </li>
      <li>
        Switch <code>moduleResolution</code> to <strong>NodeNext</strong> so the compiler enforces
        it.
      </li>
    </ul>
    <blockquote>Relative import paths need explicit file extensions in ECMAScript imports.</blockquote>
    <p>
      See the <a href="https://nodejs.org/api/esm.html">Node ESM docs</a> for the full resolution
      algorithm.
    </p>
  </>
);

const RAW =
  "The build fails because tsc emits extensionless specifiers. Add explicit .js extensions or switch moduleResolution to NodeNext.";

function Actions() {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  return (
    <>
      <CopyButton value={RAW} />
      <ResponseAction label="Good response" active={vote === "up"} onClick={() => setVote("up")}>
        <ThumbsUp size={14} />
      </ResponseAction>
      <ResponseAction
        label="Bad response"
        active={vote === "down"}
        onClick={() => setVote("down")}
      >
        <ThumbsDown size={14} />
      </ResponseAction>
      <ResponseAction label="Retry">
        <RotateCcw size={14} />
      </ResponseAction>
    </>
  );
}

const meta = {
  title: "Ai Ui/Text Response",
  component: TextResponse,
  tags: ["autodocs"],
  args: { children: PROSE },
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
} satisfies Meta<typeof TextResponse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActions: Story = { args: { actions: <Actions /> } };

export const Headings: Story = {
  args: {
    children: (
      <>
        <h2>Migration plan</h2>
        <p>Three steps, each reversible.</p>
        <ol>
          <li>Vendor the source into your tree.</li>
          <li>Swap imports from the package to the local path.</li>
          <li>Remove the dependency.</li>
        </ol>
        <hr />
        <p>Nothing else in the app changes.</p>
      </>
    ),
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <TextResponse>{PROSE}</TextResponse>
      <TextResponse actions={<Actions />}>{PROSE}</TextResponse>
    </div>
  ),
};
