import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { ArrowLeft, KeyRound, Orbit, Sparkles, Tags, UserRound } from "lucide-react";
import {
  SettingsLayout,
  SettingsHeader,
  SettingsHeading,
  SettingsBack,
  SettingsTitle,
  SettingsBody,
  SettingsNav,
  SettingsNavItem,
  SettingsContent,
} from "./settings-layout.js";
import { SettingsCard, SettingRow } from "./setting-row.js";
import { Switch } from "./switch.js";
import { Notice } from "./notice.js";
import { ThemeSwitcher } from "./theme-switcher.js";
import type { ThemePreference } from "./theme-switcher.js";

const meta = {
  title: "Layout/SettingsLayout",
  component: SettingsLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof SettingsLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const SECTIONS = [
  { id: "accounts", label: "Accounts", icon: UserRound },
  { id: "portals", label: "Portals", icon: Orbit },
  { id: "ai", label: "AI", icon: Sparkles },
  { id: "api-key", label: "Worp API", icon: KeyRound },
  { id: "categories", label: "Categories", icon: Tags },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

/** Stand-in section body, so each story shows the frame rather than a form. */
function Section({ id }: { id: SectionId }) {
  const [on, setOn] = useState(true);
  const label = SECTIONS.find((s) => s.id === id)?.label;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gousse-ink">{label}</h2>
      <SettingsCard>
        <SettingRow
          title="Weekly digest"
          description="A Monday summary of last week."
          control={<Switch checked={on} onCheckedChange={setOn} aria-label="Weekly digest" />}
        />
        <SettingRow title="Read receipts" description="Let others see when you've opened a file." />
        <SettingRow title="Retention" description="Keep uploads for 90 days." />
      </SettingsCard>
    </div>
  );
}

/**
 * The whole page, interactive. Nav rows are buttons-as-links here; in an app
 * pass `render` a router link and `active` from the current route.
 */
function Page({
  initial = "accounts",
  banner,
  back = true,
  actions = true,
}: {
  initial?: SectionId;
  banner?: React.ReactNode;
  back?: boolean;
  actions?: boolean;
}) {
  const [active, setActive] = useState<SectionId>(initial);
  const [theme, setTheme] = useState<ThemePreference>("system");

  return (
    <SettingsLayout>
      <SettingsHeader>
        <SettingsHeading>
          {back ? (
            <SettingsBack href="#" onClick={(e) => e.preventDefault()}>
              <ArrowLeft />
              Portals
            </SettingsBack>
          ) : null}
          <SettingsTitle>Settings</SettingsTitle>
        </SettingsHeading>
        {actions ? <ThemeSwitcher value={theme} onValueChange={setTheme} /> : null}
      </SettingsHeader>

      {banner}

      <SettingsBody>
        <SettingsNav>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <SettingsNavItem
              key={id}
              href={`#${id}`}
              active={active === id}
              icon={<Icon aria-hidden />}
              onClick={(e) => {
                e.preventDefault();
                setActive(id);
              }}
            >
              {label}
            </SettingsNavItem>
          ))}
        </SettingsNav>
        <SettingsContent>
          <Section id={active} />
        </SettingsContent>
      </SettingsBody>
    </SettingsLayout>
  );
}

/** The default page: back link, title, theme switcher, nav column, first section open. */
export const Default: Story = { render: () => <Page /> };

/** A later section open — the active fill and `aria-current` follow the selection. */
export const ActiveSection: Story = { render: () => <Page initial="ai" /> };

/** A banner between the header and the body — a "connected" or error notice. */
export const WithBanner: Story = {
  render: () => (
    <Page
      banner={<Notice variant="success">Google account connected. Pick a portal to use it.</Notice>}
    />
  ),
};

/** Title alone: no back link, no header controls. */
export const TitleOnly: Story = { render: () => <Page back={false} actions={false} /> };

/**
 * Below `md` the nav turns into a row above the content that scrolls sideways,
 * and the header stays on top. Opens in a phone-width viewport.
 */
export const Narrow: Story = {
  render: () => <Page initial="portals" />,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
