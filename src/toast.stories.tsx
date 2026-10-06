import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toast } from "./toast.js";
import { Button } from "./button.js";

const meta = {
  title: "Primitives/Toast",
  component: Toaster,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <Toaster>
        <Story />
      </Toaster>
    ),
  ],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Title + description, auto-dismissed after 5s. */
export const Default: Story = {
  args: {},
  render: () => (
    <Button
      onClick={() => toast.add({ title: "Recipe saved", description: "Find it under My recipes." })}
    >
      Show toast
    </Button>
  ),
};

export const Success: Story = {
  args: {},
  render: () => (
    <Button onClick={() => toast.add({ title: "Added to this week", type: "success" })}>
      Success
    </Button>
  ),
};

export const Error: Story = {
  args: {},
  render: () => (
    <Button
      onClick={() =>
        toast.add({
          title: "Couldn't save",
          description: "Check your connection and try again.",
          type: "error",
          priority: "high",
        })
      }
    >
      Error
    </Button>
  ),
};

export const Warning: Story = {
  args: {},
  render: () => (
    <Button onClick={() => toast.add({ title: "Running low on eggs", type: "warning" })}>
      Warning
    </Button>
  ),
};

export const InfoToast: Story = {
  name: "Info",
  args: {},
  render: () => (
    <Button onClick={() => toast.add({ title: "Sync runs every hour", type: "info" })}>Info</Button>
  ),
};

/** `toast.promise` — a loading toast that resolves into success or error. */
export const Loading: Story = {
  args: {},
  render: () => (
    <Button
      onClick={() =>
        toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
          loading: { title: "Importing recipe…", type: "loading" },
          success: { title: "Recipe imported", type: "success" },
          error: { title: "Import failed", type: "error" },
        })
      }
    >
      Promise
    </Button>
  ),
};

/** `actionProps` adds an inline action button. */
export const WithAction: Story = {
  args: {},
  render: () => (
    <Button
      onClick={() => {
        const id = toast.add({
          title: "Recipe deleted",
          actionProps: { children: "Undo", onClick: () => toast.close(id) },
        });
      }}
    >
      With action
    </Button>
  ),
};

/** Several at once — they stack; hover the stack to fan it out. */
export const Stacked: Story = {
  args: {},
  render: () => (
    <Button
      onClick={() => {
        toast.add({ title: "First", description: "Oldest toast." });
        toast.add({ title: "Second", type: "info" });
        toast.add({ title: "Third", type: "success" });
      }}
    >
      Show three
    </Button>
  ),
};

/** `timeout: 0` — stays until dismissed. */
export const Persistent: Story = {
  args: {},
  render: () => (
    <Button onClick={() => toast.add({ title: "Stays until closed", timeout: 0 })}>
      Persistent
    </Button>
  ),
};

export const AllVariants: Story = {
  args: {},
  render: () => (
    <Button
      onClick={() => {
        for (const type of ["success", "error", "warning", "info", "loading", undefined]) {
          toast.add({ title: type ?? "plain", description: `type: ${type}`, type, timeout: 0 });
        }
      }}
    >
      Show every type
    </Button>
  ),
};
