## Building with Gousse

Gousse is a Tailwind-based design system. Components carry their own styling; you
write Tailwind utilities for **layout glue only**, and every color you touch comes
from a `gousse-*` token — never a raw Tailwind color like `bg-gray-100`, never a hex.

### No provider needed

There is no `ThemeProvider` and no root wrapper. `styles.css` defines the tokens on
`:root`, so any component renders correctly as soon as that stylesheet is on the page.

**Dark mode is class-based**: add `class="dark"` to `<html>` (or any ancestor) and
every token flips. The variant is `@custom-variant dark (&:where(.dark, .dark *))`,
so `dark:` utilities work on your own markup too.

### The token vocabulary

These are the complete color tokens. Use them for `bg-`, `text-`, `border-`, and
`ring-`; Tailwind v4 slash-opacity works natively (`bg-gousse-ink/90`, `bg-gousse-line/40`).

| Token | Use for |
|---|---|
| `gousse-bg` | page background (warm off-white) |
| `gousse-panel` | raised surfaces — cards, popovers, field interiors |
| `gousse-ink` | primary text, and the filled/active background |
| `gousse-muted` | secondary text, placeholders, icon rests |
| `gousse-line` | borders and dividers |
| `gousse-accent` | the brand orange — highlights, badges, avatar fills |
| `gousse-high` / `gousse-medium` / `gousse-low` | priority/severity levels |

Shadows: `shadow-gousse-sm`, `-md`, `-lg`, `-xl`.
Animations: `animate-fade-in`, `animate-slide-up`, `animate-slide-out`,
`animate-slide-in-right`, `animate-bounce-subtle`, `animate-sparkle-twinkle`.

### Gousse is round

This is the system's strongest visual signature. Getting it wrong makes a design
look off-brand immediately:

- **Interactive controls are pills** — `rounded-full`. Buttons, single-line text
  fields, selects, nav rows, selectable rows.
- **Surfaces take `rounded-2xl`** — cards, popovers, dropdown panels, and
  `Textarea` (a tall box loses its first and last lines to a pill's arc).
- **A pill needs a wider inset.** Use `px-4`, not `px-2`/`px-3` — a pill eats its
  own horizontal padding at the ends, so text at a square field's inset collides
  with the corner arc. Narrow or numeric fields also take `text-center`.

Apply the same rules to layout you build yourself, so your containers sit
comfortably with the components inside them.

### Where the truth lives

- `styles.css` and its `@import` closure — the compiled tokens and component CSS.
- `components/<group>/<Name>/<Name>.prompt.md` — usage and variants per component.
- `components/<group>/<Name>/<Name>.d.ts` — the exact prop types.

Read the component's `.prompt.md` before composing it; it beats any summary here.

### Composition

Most primitives are single components (`Button`, `Input`, `Badge`, `Avatar`,
`Switch`, `Checkbox`, `Spinner`, `Separator`, `Empty`). Two are compound families
that must be assembled from their parts:

- `DropdownMenu` + `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`,
  `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuGroup`,
  `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`.
- `Sidebar` + `SidebarShell`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`,
  `SidebarGroupLabel`, `SidebarItem`, `SidebarGlyph`, `SidebarFooter`,
  `SidebarTrigger`, `SidebarClose`, `SidebarCollapsible`.
- `RadioGroup` + `RadioGroupItem`.

Two APIs worth knowing before you guess at them:

- `Badge` takes `variant`: `neutral`, `colored`, `system`, `suggested`,
  `suggestedNew`, `action` (plus an `interactive` boolean).
- `Avatar` is email-driven — `email` (required, initials are derived from it),
  `avatarUrl` for a photo, `chars` (`1` or `2`) for initials length. There is no
  `name` prop.

Every component accepts `className`, which merges **last** and wins conflicts — so
`<Button className="w-full">` is the right way to stretch one. `cn` is exported if
you need the same merge in your own markup. Icons come from `lucide-react`.

`RainbowGlow` and `Sheen` are decorative effect wrappers, not controls — wrap them
around a card or button to add the animated treatment.

### An idiomatic snippet

```jsx
const { Button, Input, Badge, Avatar } = window.GousseUI;

<div className="rounded-2xl border border-gousse-line bg-gousse-panel p-6 shadow-gousse-md">
  <div className="flex items-center gap-3">
    <Avatar email="lucas@example.com" />
    <div className="flex-1">
      <p className="text-sm font-medium text-gousse-ink">Lucas Riondel</p>
      <p className="text-xs text-gousse-muted">lucas@example.com</p>
    </div>
    <Badge variant="suggestedNew">New</Badge>
  </div>

  <Input className="mt-4" placeholder="Add a note…" />

  <div className="mt-4 flex justify-end gap-2">
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </div>
</div>
```

Note the shape rules in action: the card is `rounded-2xl` with a `gousse-line`
border on `gousse-panel`; the controls inside are pills by default; every color is
a token.
