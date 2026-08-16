# gousse-ui

A small set of React 19 + Tailwind v4 primitives — Button, Input, Badge, Select,
DropdownMenu, Dialog, Sidebar, and a couple of dozen more — built on [Base UI](https://base-ui.com)
and shipped as a **[shadcn registry](https://ui.shadcn.com/docs/registry)**.

There is no package to install. The shadcn CLI copies the component **source into
your project**, where you own it: change a variant, add a size, retheme a token —
it's your file. No registry credential, no authentication step, MIT licensed.

**Registry:** <https://lucasriondel.github.io/gousse-ui> ·
**Storybook:** <https://lucasriondel.github.io/gousse-ui/storybook/>

## Install a component

```bash
npx shadcn@latest add https://lucasriondel.github.io/gousse-ui/r/button.json
```

Dependencies resolve themselves: `button` pulls in `utils` (the `cn` helper) and
the `theme`/`tokens` stylesheets, and installs `class-variance-authority`. Take
one component or all of them — nothing forces you to adopt the whole set.

To shorten the command, register the namespace in your `components.json`:

```json
{
  "registries": {
    "@gousse": "https://lucasriondel.github.io/gousse-ui/r/{name}.json"
  }
}
```

```bash
npx shadcn@latest add @gousse/button @gousse/sidebar
```

Files land wherever your `components.json` aliases point — components at your
`ui` alias, `utils`/`field-chrome` at your `lib` alias, stylesheets under
`src/styles/gousse/`.

## What you're taking on

| | |
|---|---|
| React | `^19` (peer — yours, never installed by the registry) |
| Tailwind | `v4` (`tailwindcss@^4.3`), CSS-first config — no `tailwind.config.ts` |
| Primitives | `@base-ui-components/react@1.0.0-rc.0` — **a release candidate**, used by Dialog, DropdownMenu and Separator |
| Also pulled in | `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react` |

The Base UI pin is a prerelease. That's a real adoption consideration, not a
footnote — components that use it may need touching when Base UI hits 1.0.
Everything else (Button, Input, Badge, Select, Checkbox, Switch, RadioGroup,
Textarea, Sidebar, Empty, Avatar, Spinner, Sheen, RainbowGlow, Notice, Steps,
SettingRow, SecretField, SavedFlash, ProviderMark, CredentialTile, ModelRow)
wraps native elements or plain markup and doesn't depend on it.

## Wire up the theme

Installing any component brings the stylesheets along. Add them to your entry
stylesheet — order matters, `tokens.css` defines the `--gousse-*` channel vars
that `theme.css` maps onto Tailwind theme variables:

```css
@import "tailwindcss";
@import "./styles/gousse/tokens.css";  /* --gousse-* channel vars (:root/.dark) */
@import "./styles/gousse/theme.css";   /* @theme mapping → bg-gousse-*, shadow-gousse-*, animate-* */
@import "./styles/gousse/effects.css"; /* RainbowGlow / Sheen — and Select */
```

`effects.css` is not optional if you use `Select`: a native `<select>` is
painted by the OS, which ignores `border-radius`, so the sheet's
`.gousse-select` reset is what lets the control take its shape at all. Skip the
import and selects render with square OS corners and a doubled arrow.

Dark mode is class-based: `theme.css` declares
`@custom-variant dark (&:where(.dark, .dark *))`, so flip `<html class="dark">`
from your own toggle. Rebrand by overriding `--gousse-*` at any scope — the
components read tokens only through theme utilities (`text-gousse-ink`,
`bg-gousse-panel`, `shadow-gousse-md`), never a hardcoded color.

## Shape: the kit is round

Controls are **pills**. Button, Input, Select, RadioGroupItem and SidebarItem
are all `rounded-full`; where a shape is in doubt, gousse takes the rounder
option. A pill also sidesteps concentric-radius arithmetic — it has no corner to
disagree with its parent's, so it sits correctly inside a card of any radius.

Two consequences worth knowing before you restyle anything:

- **Round means wide.** A pill eats its own horizontal padding at the ends, so
  insets are larger than a square control's (`px-4` on Button and the text
  fields, not `px-3`/`px-2`). Narrow or numeric fields want `text-center` on top
  — an off-centre value inside a pill reads as broken.
- **Not everything is a pill.** `Textarea` takes `rounded-2xl`: a tall
  multi-line box with fully-round ends loses its first and last lines to the
  corner arc. Radius therefore lives *outside* the shared `FIELD_CHROME` string
  (as `FIELD_PILL` / `FIELD_BOX`) so single- and multi-line fields can share
  chrome without sharing shape.

Every radius is a class on a component you now own — override it in place.

## Registry items

| item | type | what it is |
|---|---|---|
| `avatar` `badge` `button` `checkbox` `dialog` `dropdown-menu` `empty` `input` `notice` `radio-group` `rainbow-glow` `select` `separator` `setting-row` `sheen` `sidebar` `spinner` `steps` `switch` `textarea` | `registry:ui` | the components |
| `credential-tile` `model-row` `provider-mark` `saved-flash` `secret-field` | `registry:ui` | the AI-provider set — credential entry and model choice |
| `utils` `field-chrome` | `registry:lib` | `cn()`, and the shared text-field chrome string |
| `tokens` `theme` `effects` | `registry:file` | the three stylesheets |

Full index: [`registry.json`](https://lucasriondel.github.io/gousse-ui/registry.json).

## Development

Uses [Bun](https://bun.sh).

```bash
bun install
bun run storybook        # dev harness on :6006 — the way to build and see components
bun run test             # registry generation tests
bun run typecheck        # tsc --noEmit over src/ and scripts/
bun run build-registry   # emit registry-static/ (registry.json + r/*.json + landing page)
```

Every component is one file in `src/` with a co-located `*.stories.tsx`; stories
are the coverage contract. See [`CLAUDE.md`](./CLAUDE.md) for conventions.

### How the registry is built

`scripts/build-registry.ts` derives the whole registry from `src/`. Item names
come from filenames, npm dependencies from the imports each file actually makes
(versioned off `package.json`), registry dependencies from relative imports and
from the design tokens / effect classes the source uses. Relative imports are
rewritten to shadcn aliases (`./utils` → `@/lib/utils`) so the CLI can place
files according to the consumer's own `components.json`.

Nothing is hand-maintained — adding `src/foo.tsx` publishes `foo`. Two gates run
before anything is written, and both fail the build rather than warn:

1. every import in every shipped file resolves to a declared npm dependency, a
   declared registry dependency, or a file bundled in the same item;
2. every generated document validates against the shadcn registry schema
   (`scripts/registry-schema.ts`, a zod mirror of the upstream JSON Schema).

`bun test` runs both over the real component source.

### Hosting

A push to `main` runs [`.github/workflows/pages.yml`](.github/workflows/pages.yml):
typecheck → test → build the registry → build Storybook into
`registry-static/storybook` → deploy the whole directory to GitHub Pages. Static
files, no service to keep running.

## Distribution history

Gousse UI was previously published as a private npm package to GitHub Packages
(`@lucasriondel/gousse-ui`, last release `0.4.1`). GitHub Packages requires an
authentication token for every install, which made the package unusable by anyone
without a credential.

**The registry is now the single distribution path.** The package is marked
`private` and is no longer published anywhere. The `dist/` build and the
`exports` map survive only until the last consumer of `0.4.1` migrates onto
vendored source; they are not a supported entry point.

The last two package releases, for anyone still on them:

- **0.4.1 — `dist` is valid Node ESM.** `dist` ships as `"type": "module"` but
  emitted extensionless relative specifiers (`from "./utils"`), which Node's ESM
  resolver rejects; importing off the bundler path (plain `node`, Vitest, SSR)
  failed with `ERR_MODULE_NOT_FOUND`. Every relative import in `src/` now carries
  an explicit `.js` extension and `moduleResolution` is `NodeNext`. No API or
  visual change; consumers who inlined the package to work around it (e.g. Vitest
  `server.deps.inline`) can drop that workaround.
- **0.3.0 — Tailwind v4 CSS-first theme (breaking).** Removed the
  `@lucasriondel/gousse-ui/preset` entry point and the `goussePreset` JS export;
  added `theme.css` in its place. Requires `tailwindcss@^4.3`. The `--gousse-*`
  runtime tokens, class-based `.dark` mode, and every `bg-gousse-*` /
  `shadow-gousse-*` / `animate-*` utility are preserved, and component visuals
  are unchanged.

Because the registry copies source at install time, you are not tracking a
version, and fixes made here will not reach components you have already
installed. That is the shadcn trade: ownership and editability instead of
automatic updates.

## License

[MIT](./LICENSE) © Lucas Riondel
