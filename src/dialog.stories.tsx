import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogCloseButton,
} from "./dialog.js";
import { Button } from "./button.js";
import { Input } from "./input.js";
import { Steps } from "./steps.js";

const meta = {
  title: "Primitives/Dialog",
  component: Dialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default: a trigger opens it, Escape and the backdrop close it. */
export const Default: Story = {
  args: {},
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="primary">Open dialog</Button>} />
      <DialogContent>
        <DialogCloseButton />
        <DialogHeader>
          <DialogTitle>Rename workspace</DialogTitle>
          <DialogDescription>
            Everyone with access sees the new name. Links keep working.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5">
          <Input defaultValue="Gousse" aria-label="Workspace name" className="w-full" />
        </div>
        <DialogFooter className="mt-6">
          <DialogClose render={<Button>Cancel</Button>} />
          <DialogClose render={<Button variant="primary">Save</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** Destructive confirm — the danger button carries the weight, not the copy. */
export const Destructive: Story = {
  args: {},
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="danger">Delete project</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete “Onboarding rewrite”?</DialogTitle>
          <DialogDescription>
            This removes the project and its 42 tasks. It cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6">
          <DialogClose render={<Button>Keep it</Button>} />
          <DialogClose render={<Button variant="danger">Delete</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * `dismissible={false}` — a blocking gate. Escape, the backdrop and focus-out
 * are all refused; the only way out is the button that finishes the flow.
 */
export const NonDismissable: Story = {
  args: {},
  render: function NonDismissableStory() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Open blocking gate
        </Button>
        <Dialog open={open} onOpenChange={setOpen} dismissible={false}>
          <DialogContent className="text-center">
            <div className="flex flex-col items-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-gousse-accent/15 text-2xl shadow-gousse-sm">
                🍯
              </div>
              <div className="mt-4">
                <Steps
                  steps={[
                    { id: "connect", label: "Connect" },
                    { id: "ai", label: "Set up AI" },
                  ]}
                  current="connect"
                />
              </div>
            </div>
            <DialogHeader className="mt-5">
              <DialogTitle>Connect an account</DialogTitle>
              <DialogDescription>
                Nothing works until there is an account to work on. Escape and the backdrop are
                refused here — finish the step or stay.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6">
              <Button variant="primary" onClick={() => setOpen(false)}>
                Connect Google
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  },
};

/** A wide panel for form-shaped content. `className` overrides the `max-w-md` default. */
export const Wide: Story = {
  args: {},
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open wide dialog</Button>} />
      <DialogContent className="sm:max-w-xl">
        <DialogCloseButton />
        <DialogHeader>
          <DialogTitle>Invite teammates</DialogTitle>
          <DialogDescription>
            They get an email with a join link that expires in seven days.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-5 flex flex-col gap-2">
          <Input placeholder="ada@example.com" aria-label="Email" className="w-full" />
          <Input placeholder="grace@example.com" aria-label="Email" className="w-full" />
        </div>
        <DialogFooter className="mt-6">
          <DialogClose render={<Button>Cancel</Button>} />
          <DialogClose render={<Button variant="primary">Send invites</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** Long body — the panel scrolls inside the viewport rather than overflowing it. */
export const Scrolling: Story = {
  args: {},
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open long dialog</Button>} />
      <DialogContent>
        <DialogCloseButton />
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
          <DialogDescription>Everything that shipped this month.</DialogDescription>
        </DialogHeader>
        <div className="mt-5 flex flex-col gap-3 text-sm text-gousse-muted">
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i}>
              Entry {i + 1} — a change that was made, described at just enough length to push this
              panel past the height of the window.
            </p>
          ))}
        </div>
        <DialogFooter className="mt-6">
          <DialogClose render={<Button variant="primary">Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
