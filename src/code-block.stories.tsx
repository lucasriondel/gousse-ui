import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeBlock } from "./code-block.js";

const TS = `import { cn } from "./utils.js";

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-xs", className)}
      {...props}
    />
  );
}`;

const LONG = Array.from(
  { length: 40 },
  (_, i) => `console.log("step ${i + 1}: processing batch", { size: ${(i + 1) * 128} });`,
).join("\n");

const meta = {
  title: "Ai Ui/Code Block",
  component: CodeBlock,
  tags: ["autodocs"],
  args: { code: TS, language: "tsx" },
  argTypes: { lineNumbers: { control: "boolean" } },
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LineNumbers: Story = { args: { lineNumbers: true } };

export const HighlightLines: Story = { args: { lineNumbers: true, highlightLines: [5, 6] } };

export const LongScrolling: Story = {
  args: { code: LONG, language: "js", lineNumbers: true, maxHeight: 240 },
};

export const Filename: Story = {
  args: { language: "src/badge.tsx", lineNumbers: true },
};

export const Shell: Story = {
  args: { code: "bun install\nbun run build-registry", language: "bash" },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CodeBlock code={TS} language="tsx" />
      <CodeBlock code={TS} language="tsx" lineNumbers />
      <CodeBlock code={TS} language="src/badge.tsx" lineNumbers highlightLines={[5, 6]} />
      <CodeBlock code={LONG} language="js" lineNumbers maxHeight={160} />
    </div>
  ),
};
