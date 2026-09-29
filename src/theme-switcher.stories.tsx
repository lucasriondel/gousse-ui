import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Plus } from "lucide-react";
import { Button } from "./button.js";
import { ThemeSwitcher, type ThemePreference } from "./theme-switcher.js";
import { cn } from "./utils.js";

const meta = {
  title: "Primitives/ThemeSwitcher",
  component: ThemeSwitcher,
  tags: ["autodocs"],
  args: { value: "system", onValueChange: () => {} },
  argTypes: {
    value: { control: "inline-radio", options: ["light", "system", "dark"] },
    size: { control: "inline-radio", options: ["default", "sm"] },
    showSystem: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<ThemePreference>("system");
    return <ThemeSwitcher {...args} value={value} onValueChange={setValue} />;
  },
};

/** Two-way light/dark pick — `showSystem={false}` drops the middle segment. */
export const WithoutSystem: Story = {
  render: (args) => {
    const [value, setValue] = useState<ThemePreference>("light");
    return <ThemeSwitcher {...args} showSystem={false} value={value} onValueChange={setValue} />;
  },
};

export const Small: Story = {
  render: (args) => {
    const [value, setValue] = useState<ThemePreference>("dark");
    return <ThemeSwitcher {...args} size="sm" value={value} onValueChange={setValue} />;
  },
};

export const Disabled: Story = { args: { value: "light", disabled: true } };

/** `showSystem={false}` fed a stale `"system"`: nothing checked, thumb hidden. */
export const UnmatchedValue: Story = { args: { value: "system", showSystem: false } };

export const AllVariants: Story = {
  render: () => {
    const [value, setValue] = useState<ThemePreference>("system");
    const rows = [
      { label: "default", props: {} },
      { label: "sm", props: { size: "sm" as const } },
      { label: "no system", props: { showSystem: false } },
      { label: "sm, no system", props: { size: "sm" as const, showSystem: false } },
      { label: "disabled", props: { disabled: true } },
    ];
    return (
      <div className="flex flex-col gap-4">
        {rows.map(({ label, props }) => (
          <div key={label} className="flex items-center gap-4">
            <span className="w-28 text-xs font-medium text-gousse-muted">{label}</span>
            <ThemeSwitcher {...props} value={value} onValueChange={setValue} />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Each switcher size beside every Button size, centre-aligned, so the chassis
 * heights can be compared at a glance: the default switcher (48px) against
 * `md` (40px) and `icon` (36px), `sm` (36px) against `sm` (32px).
 */
export const NextToButton: Story = {
  render: () => {
    const [value, setValue] = useState<ThemePreference>("system");
    return (
      <div className="flex flex-col gap-6">
        {(["default", "sm"] as const).map((size) => (
          <div key={size} className="flex items-center gap-3">
            <span className="w-16 text-xs font-medium text-gousse-muted">{size}</span>
            <ThemeSwitcher size={size} value={value} onValueChange={setValue} />
            <Button variant="secondary" size="md">
              md
            </Button>
            <Button variant="secondary" size="icon" aria-label="Add">
              <Plus className="size-4" />
            </Button>
            <Button variant="secondary">default</Button>
            <Button variant="secondary" size="sm">
              sm
            </Button>
          </div>
        ))}
      </div>
    );
  },
};

function usePrefersDark() {
  const [dark, setDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return dark;
}

/**
 * The consumer wiring: resolve `"system"` against the OS and scope `.dark` to
 * a subtree (the token sheet rebinds every `--gousse-*` var under it), so the
 * panel flips independently of the toolbar theme.
 */
export const DrivingTheTheme: Story = {
  render: () => {
    const [value, setValue] = useState<ThemePreference>("system");
    const prefersDark = usePrefersDark();
    const dark = value === "dark" || (value === "system" && prefersDark);
    return (
      <div
        className={cn(
          "flex w-96 items-center justify-between rounded-2xl border border-gousse-line bg-gousse-panel p-5 text-gousse-ink shadow-gousse-sm transition-colors",
          dark && "dark",
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Theme</span>
          <span className="text-xs text-gousse-muted">
            {dark ? "Dark" : "Light"}
            {value === "system" ? ", following your system" : ""}
          </span>
        </div>
        <ThemeSwitcher value={value} onValueChange={setValue} />
      </div>
    );
  },
};
