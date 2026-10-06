import type { Meta, StoryObj } from "@storybook/react-vite";
import { MoreHorizontal } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card.js";
import { Badge } from "./badge.js";
import { Button } from "./button.js";

const meta = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Header, body and footer actions — the full anatomy. */
export const Default: Story = {
  args: {},
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Tarte aux poireaux</CardTitle>
        <CardDescription>45 min · serves 4</CardDescription>
      </CardHeader>
      <CardContent>
        Leeks melted slowly in butter, folded into a custard and baked in a short crust.
      </CardContent>
      <CardFooter className="justify-end">
        <Button size="sm">Share</Button>
        <Button size="sm" variant="primary">
          Cook
        </Button>
      </CardFooter>
    </Card>
  ),
};

/** `size="sm"` — the whole card tightens through the one `--card-spacing` knob. */
export const Small: Story = {
  args: {},
  render: () => (
    <Card size="sm" className="w-72">
      <CardHeader>
        <CardTitle>Shopping list</CardTitle>
        <CardDescription>12 items</CardDescription>
      </CardHeader>
      <CardContent>Leeks, eggs, crème fraîche, butter, flour…</CardContent>
    </Card>
  ),
};

/** CardAction pins a control top-right; the header grows a second column only when it's there. */
export const WithAction: Story = {
  args: {},
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Weekly plan</CardTitle>
        <CardDescription>Mon 6 – Sun 12 Oct</CardDescription>
        <CardAction>
          <Button size="icon" variant="ghost" aria-label="More">
            <MoreHorizontal size={16} />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Badge>7 dinners</Badge>
        <Badge>3 lunches</Badge>
      </CardContent>
    </Card>
  ),
};

/** A full-bleed image first in the card drops the top padding and takes the card's corners. */
export const WithImage: Story = {
  args: {},
  render: () => (
    <Card className="w-80">
      <img
        alt=""
        className="aspect-video w-full object-cover"
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23dc7828'/%3E%3C/svg%3E"
      />
      <CardHeader>
        <CardTitle>Soupe au pistou</CardTitle>
        <CardDescription>Summer vegetables, basil, parmesan</CardDescription>
      </CardHeader>
    </Card>
  ),
};

/** `border-t` on the footer rules it off from the body. */
export const RuledFooter: Story = {
  args: {},
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Pantry</CardTitle>
        <CardDescription>Last updated yesterday</CardDescription>
      </CardHeader>
      <CardContent>23 items in stock, 4 running low.</CardContent>
      <CardFooter className="border-t">
        <Button size="sm" variant="ghost">
          View all
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {(["default", "sm"] as const).map((size) => (
        <Card key={size} size={size} className="w-64">
          <CardHeader>
            <CardTitle>size="{size}"</CardTitle>
            <CardDescription>Description line</CardDescription>
          </CardHeader>
          <CardContent>Body content.</CardContent>
          <CardFooter className="border-t">
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  ),
};
