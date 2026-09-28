import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { Button } from "./button.js";

const meta = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Button" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: "inline-radio",
      options: ["default", "md", "sm", "icon"],
    },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Danger: Story = { args: { variant: "danger", children: "Delete" } };
export const Disabled: Story = { args: { variant: "primary", disabled: true } };

export const SizeDefault: Story = { args: { variant: "primary", size: "default" } };
export const SizeMd: Story = { args: { variant: "primary", size: "md" } };
export const SizeSm: Story = { args: { variant: "primary", size: "sm" } };
export const SizeIcon: Story = {
  args: {
    variant: "primary",
    size: "icon",
    "aria-label": "Add",
    children: <Plus className="size-4" />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
};

/** Every size against every variant — the matrix that keeps the scale honest. */
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(["default", "md", "sm", "icon"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          <span className="w-16 text-xs font-medium text-gousse-muted">{size}</span>
          {(["primary", "secondary", "ghost", "danger"] as const).map((variant) =>
            size === "icon" ? (
              <Button key={variant} variant={variant} size={size} aria-label={variant}>
                <Plus className="size-4" />
              </Button>
            ) : (
              <Button key={variant} variant={variant} size={size}>
                {variant}
              </Button>
            ),
          )}
        </div>
      ))}
    </div>
  ),
};

/** Focus ring check — tab through these; every one must show a visible ring. */
export const FocusRing: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary" autoFocus>
        Focused
      </Button>
      <Button variant="secondary">Tab to me</Button>
      <Button variant="ghost">And me</Button>
      <Button variant="danger">And me</Button>
    </div>
  ),
};
