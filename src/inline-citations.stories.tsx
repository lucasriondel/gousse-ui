import type { Meta, StoryObj } from "@storybook/react-vite";
import { Citation, CitedText, SourceList, type Source } from "./inline-citations.js";

const SOURCES: Source[] = [
  {
    n: 1,
    title: "Bun 1.2 release notes",
    url: "https://bun.sh/blog/bun-v1.2",
    snippet: "Bun 1.2 ships a built-in Postgres client, S3 support and a text-based lockfile.",
  },
  {
    n: 2,
    title: "Node.js ECMAScript modules",
    url: "https://nodejs.org/api/esm.html",
    snippet: "Relative specifiers must include the file extension.",
  },
  {
    n: 3,
    title: "TypeScript: moduleResolution",
    url: "https://www.typescriptlang.org/tsconfig/#moduleResolution",
  },
];

const TEXT =
  "Bun now ships a built-in Postgres client [1]. Under Node's ESM resolver, relative imports need explicit extensions [2], which TypeScript enforces under NodeNext resolution [3].";

const meta = {
  title: "Ai Ui/Inline Citations",
  component: CitedText,
  tags: ["autodocs"],
  args: { text: TEXT, sources: SOURCES },
  decorators: [(Story) => <div className="max-w-xl">{Story()}</div>],
} satisfies Meta<typeof CitedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutSourceList: Story = { args: { showSources: false } };

export const Composed: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <p className="text-sm leading-relaxed text-gousse-ink">
        The resolver change is documented in the <strong>Node docs</strong>
        <Citation source={SOURCES[1]!} /> and mirrored by the compiler's own option
        <Citation source={SOURCES[2]!} />.
      </p>
      <SourceList sources={[SOURCES[1]!, SOURCES[2]!]} />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <CitedText text={TEXT} sources={SOURCES} />
      <CitedText text={TEXT} sources={SOURCES} showSources={false} />
    </div>
  ),
};
