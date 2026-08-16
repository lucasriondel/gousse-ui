import type { Meta, StoryObj } from "@storybook/react-vite";
import { KeyRound } from "lucide-react";
import { Notice, NoticeList, NoticeListItem } from "./notice.js";

const meta = {
  title: "Primitives/Notice",
  component: Notice,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["danger", "warning", "success", "info"] },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof Notice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Danger: Story = {
  args: {
    variant: "danger",
    children: "Google refused the connection. The consent screen was dismissed before it finished.",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    children: "This key is close to its monthly quota. Requests will start failing on the 1st.",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    children: "Credential stored. Triage will use it on the next sync.",
  },
};

export const Info: Story = {
  args: {
    variant: "info",
    children: "Replies and filters keep their defaults — all three are yours to change later.",
  },
};

/** `icon={null}` drops the glyph and collapses the gap with it. */
export const NoIcon: Story = {
  args: {
    variant: "info",
    icon: null,
    children: "A quiet aside with nothing to point at.",
  },
};

/** Any node works as the glyph — a different lucide icon, an emoji, a mark. */
export const CustomIcon: Story = {
  args: {
    variant: "warning",
    icon: <KeyRound size={16} className="mt-0.5 shrink-0" aria-hidden />,
    children: "No provider key is stored yet, so triage is running on the local model.",
  },
};

/** Long copy wraps against the glyph's column rather than under it. */
export const LongBody: Story = {
  args: {
    variant: "danger",
    children:
      "The token exchange failed. This usually means the redirect URI registered with the OAuth client does not match the one this server sends — they have to be identical, including the scheme and any trailing slash. Check the client in the Google Cloud console, then restart the API.",
  },
};

/** A stack of them, as `<ul>`/`<li>` so the count is announced. */
export const List: Story = {
  args: { children: null },
  render: () => (
    <NoticeList>
      <NoticeListItem title={<code className="font-mono">GOOGLE_CLIENT_ID</code>}>
        The OAuth client id of your Google Cloud Web application client.
      </NoticeListItem>
      <NoticeListItem title={<code className="font-mono">GOOGLE_CLIENT_SECRET</code>}>
        That client's secret. It stays on the server and is never sent here.
      </NoticeListItem>
      <NoticeListItem title={<code className="font-mono">GOOGLE_REDIRECT_URI</code>} />
    </NoticeList>
  ),
};

export const AllVariants: Story = {
  args: { children: null },
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Notice variant="danger">Something failed and needs attention.</Notice>
      <Notice variant="warning">Something is about to fail.</Notice>
      <Notice variant="success">Something worked.</Notice>
      <Notice variant="info">Something worth knowing.</Notice>
      <NoticeList>
        <NoticeListItem variant="warning" title="One of several">
          The list variant, sharing the same chrome.
        </NoticeListItem>
        <NoticeListItem variant="warning" title="Another" />
      </NoticeList>
    </div>
  ),
};
