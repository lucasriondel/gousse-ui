import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton.js";
import { Card, CardContent, CardHeader } from "./card.js";

const meta = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A bare block — the caller always sets the size. */
export const Default: Story = {
  args: { className: "h-4 w-48" },
};

/** Shaped to what it stands in for: avatar, text lines, a pill button. */
export const Shapes: Story = {
  args: {},
  render: () => (
    <div className="flex items-center gap-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
  ),
};

/** A loading card — the layout holds while the content is in flight. */
export const CardPlaceholder: Story = {
  args: {},
  render: () => (
    <Card className="w-80">
      <Skeleton className="-mt-6 aspect-video w-full rounded-none" />
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
    </Card>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-24 w-64 rounded-3xl" />
      <div className="flex gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="size-12 rounded-full" />
      </div>
    </div>
  ),
};
