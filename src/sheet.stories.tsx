import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
  SheetCloseButton,
  type SheetSide,
} from "./sheet.js";
import { Button } from "./button.js";
import { Input } from "./input.js";

const meta = {
  title: "Primitives/Sheet",
  component: Sheet,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

function Example({ side, label = side }: { side: SheetSide; label?: string }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button>{label}</Button>} />
      <SheetContent side={side}>
        <SheetCloseButton />
        <SheetHeader>
          <SheetTitle>Edit recipe</SheetTitle>
          <SheetDescription>Changes are saved when you close the sheet.</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-2">
          <Input defaultValue="Tarte aux poireaux" aria-label="Name" className="w-full" />
          <Input defaultValue="45 min" aria-label="Duration" className="w-full" />
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button variant="primary">Save</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Slides in from the right — the default side. */
export const Default: Story = {
  args: {},
  render: () => <Example side="right" label="Open sheet" />,
};

export const Left: Story = { args: {}, render: () => <Example side="left" /> };

export const Top: Story = { args: {}, render: () => <Example side="top" /> };

/** `side="bottom"` — the mobile drawer, with a grab handle and a height cap. */
export const Drawer: Story = {
  args: {},
  render: () => <Example side="bottom" label="Open drawer" />,
};

/** A long body scrolls inside SheetBody; header and footer stay put. */
export const Scrolling: Story = {
  args: {},
  render: () => (
    <Sheet>
      <SheetTrigger render={<Button>Open long sheet</Button>} />
      <SheetContent>
        <SheetCloseButton />
        <SheetHeader>
          <SheetTitle>Ingredients</SheetTitle>
          <SheetDescription>Everything in the pantry.</SheetDescription>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-3 text-gousse-muted">
          {Array.from({ length: 40 }, (_, i) => (
            <p key={i}>Ingredient {i + 1}</p>
          ))}
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button variant="primary">Done</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
};

/** Starts open — the resting state, for visual review. */
export const Open: Story = {
  args: {},
  render: () => (
    <Sheet defaultOpen>
      <SheetTrigger render={<Button>Open</Button>} />
      <SheetContent>
        <SheetCloseButton />
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the recipe list.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="flex gap-2">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Example key={side} side={side} />
      ))}
    </div>
  ),
};
