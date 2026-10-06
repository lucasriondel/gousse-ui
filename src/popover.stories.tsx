import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "./popover.js";
import { Button } from "./button.js";
import { Input } from "./input.js";

const meta = {
  title: "Primitives/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Title, description and a small form, anchored below the trigger. */
export const Default: Story = {
  args: {},
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button>Servings</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Scale recipe</PopoverTitle>
          <PopoverDescription>Quantities update for every ingredient.</PopoverDescription>
        </PopoverHeader>
        <Input type="number" defaultValue={4} aria-label="Servings" className="w-20 text-center" />
        <div className="flex justify-end">
          <PopoverClose
            render={
              <Button variant="primary" size="sm">
                Apply
              </Button>
            }
          />
        </div>
      </PopoverContent>
    </Popover>
  ),
};

/** Starts open — the resting state, for visual review. */
export const Open: Story = {
  args: {},
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger render={<Button>Info</Button>} />
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Seasonal</PopoverTitle>
          <PopoverDescription>Leeks are at their best from October to March.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

/** `side` / `align` place the popup around the trigger. */
export const Sides: Story = {
  args: {},
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-24">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger render={<Button>{side}</Button>} />
          <PopoverContent side={side} className="w-48">
            <PopoverDescription>Opens on the {side}.</PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

/** A disabled trigger never opens. */
export const Disabled: Story = {
  args: {},
  render: () => (
    <Popover>
      <PopoverTrigger disabled render={<Button disabled>Unavailable</Button>} />
      <PopoverContent>Never shown.</PopoverContent>
    </Popover>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="flex gap-4 p-24">
      <Popover defaultOpen>
        <PopoverTrigger render={<Button>Open</Button>} />
        <PopoverContent side="bottom" className="w-56">
          <PopoverHeader>
            <PopoverTitle>Title</PopoverTitle>
            <PopoverDescription>Description</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button>Closed</Button>} />
        <PopoverContent>Content</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger disabled render={<Button disabled>Disabled</Button>} />
        <PopoverContent>Content</PopoverContent>
      </Popover>
    </div>
  ),
};
