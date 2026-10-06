import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bold, Italic, Underline } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip.js";
import { Button } from "./button.js";

const meta = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover or focus the trigger. */
export const Default: Story = {
  args: {},
  render: () => (
    <Tooltip>
      <TooltipTrigger render={<Button>Hover me</Button>} />
      <TooltipContent>Adds the recipe to this week</TooltipContent>
    </Tooltip>
  ),
};

/** Starts open — the resting state, for visual review. */
export const Open: Story = {
  args: {},
  render: () => (
    <Tooltip defaultOpen>
      <TooltipTrigger render={<Button>Trigger</Button>} />
      <TooltipContent>Always visible</TooltipContent>
    </Tooltip>
  ),
};

/** `side` places the bubble; the arrow follows. */
export const Sides: Story = {
  args: {},
  render: () => (
    <div className="grid grid-cols-2 gap-6 p-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} defaultOpen>
          <TooltipTrigger render={<Button>{side}</Button>} />
          <TooltipContent side={side}>On the {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

/** Inside one provider, moving between neighbours opens the next instantly. */
export const Toolbar: Story = {
  args: {},
  render: () => (
    <div className="flex gap-1">
      {[
        { label: "Bold", Icon: Bold },
        { label: "Italic", Icon: Italic },
        { label: "Underline", Icon: Underline },
      ].map(({ label, Icon }) => (
        <Tooltip key={label}>
          <TooltipTrigger
            render={
              <Button size="icon" variant="ghost" aria-label={label}>
                <Icon size={16} />
              </Button>
            }
          />
          <TooltipContent>{label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

/** A disabled tooltip never opens, even on hover. */
export const Disabled: Story = {
  args: {},
  render: () => (
    <Tooltip disabled>
      <TooltipTrigger render={<Button>No tooltip</Button>} />
      <TooltipContent>Never shown</TooltipContent>
    </Tooltip>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="flex gap-10 p-16">
      {(["top", "bottom"] as const).map((side) => (
        <Tooltip key={side} defaultOpen>
          <TooltipTrigger render={<Button>{side}</Button>} />
          <TooltipContent side={side}>Label on {side}</TooltipContent>
        </Tooltip>
      ))}
      <Tooltip disabled>
        <TooltipTrigger render={<Button>Disabled</Button>} />
        <TooltipContent>Never shown</TooltipContent>
      </Tooltip>
    </div>
  ),
};
