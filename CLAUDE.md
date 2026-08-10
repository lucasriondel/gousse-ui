# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`gousse-ui` — the Gousse design-system primitives (React 19 + Tailwind v4). Headless-styled components (Button, Input, Badge, Select, DropdownMenu, …), design tokens, and a CSS-first Tailwind theme (`theme.css`). **Public (MIT), distributed as a shadcn registry** — consumers copy the source into their own tree; there is no published npm package. This repo was extracted from a monorepo; comments still reference the old `packages/web` and `packages/ui` homes.

## Commands

Uses **Bun** as the package manager.

```bash
bun install              # install deps
bun run storybook        # dev harness on :6006 — primary way to build/see components
bun run typecheck        # tsc --noEmit over src/ + scripts/; run before committing
bun run test             # bun test — the registry generation gates + the dist ESM smoke check
bun run build-registry   # emit registry-static/ (registry.json + r/*.json + landing page)
bun run build-storybook  # static Storybook
bun run build            # tsc -> dist/ + copy-css — legacy npm artifact, see below
```

`typecheck` and `test` are the gates; there is **no linter** (`bun run lint` is a no-op echo). There are **no component unit tests** — components are validated visually in Storybook (`*.stories.tsx` next to each component). `bun test` covers exactly two things: `scripts/build-registry.test.ts` (registry generation) and `test/dist-esm.test.ts` (the built `dist` is loadable by Node's ESM resolver — see the `.js`-extension rule below; it builds `dist` as a side effect). Both gates run in CI (`.github/workflows/ci.yml`).

**Stories are the coverage contract: every component must have stories covering every state.** One story per meaningful state — each variant, size, `disabled`/loading/active/error/empty state, and any collapsed/expanded or open/closed mode — plus an `AllVariants`-style story showing them side by side. Adding a variant or state without a story that exercises it is incomplete work. See `button.stories.tsx` (variant + disabled + `AllVariants`) and `sidebar.stories.tsx` (`Default` + `Collapsed`).

## Architecture

- **Every primitive is one file in `src/`** with a co-located `*.stories.tsx`. One file in `src/` == one registry item, named after the file — that's the whole publishing manifest, so the filename *is* the public name. Follow the existing "one component per file" convention. `src/index.ts` is the legacy npm barrel; keep it in sync while it exists, but it is not part of the registry payload.
- **Relative imports must carry an explicit `.js` extension** — `import { cn } from "./utils.js"`, even though the file is `utils.ts`. The package is `"type": "module"` and `tsc` emits specifiers verbatim; Node's ESM resolver does no extension guessing, so extensionless specifiers ship a `dist` that only bundlers can load. `moduleResolution` is `NodeNext`, so `typecheck` rejects a missing extension (TS2835), and `test/dist-esm.test.ts` re-checks the built output. The registry generator strips the extension before aliasing (`./utils.js` → `@/lib/utils`), so the two rules coexist.
- **Styling is class-string based**, no CSS-in-JS. Components accept a `className` that always merges *last* via `cn()` (`src/utils.ts` — clsx + tailwind-merge, dedupes conflicts). Variants use **cva** (`class-variance-authority`); see `src/button.tsx` for the canonical pattern.
- **Shared style strings are extracted to constants** so related components can't drift: `src/field-chrome.ts` (`FIELD_CHROME`, shared by Input/Select/Textarea, plus the `FIELD_PILL`/`FIELD_BOX` radii it deliberately keeps separate so a textarea can share chrome without taking the pill), and `POPUP_*`/`ITEM_*` consts inside `dropdown-menu.tsx`. Reuse these rather than re-typing chrome.
- **Interactive/popover components wrap Base UI** (`@base-ui-components/react`) in shadcn-flavoured wrappers, restyled with gousse tokens (see `dropdown-menu.tsx`). Simple form controls wrap the **native** element (see `select.tsx`) to keep OS semantics.
- Icons: `lucide-react`.

### Adding a new component ported from shadcn/ui

This repo *serves* a shadcn registry but does not *consume* one: the CLI (`npx shadcn@latest add <name>`) targets a `components/ui/` + `lib/utils` alias layout defined in a `components.json`, and we keep the flat `src/` layout instead. **Port manually**, adapting to gousse conventions:

1. **Get the source.** Read it on the docs site (<https://ui.shadcn.com/docs/components/<name>>), or fetch the raw JSON from the registry: `https://ui.shadcn.com/r/styles/default/<name>.json` (the `files[].content` field holds the component source). Reference: <https://ui.shadcn.com/docs/cli> and <https://ui.shadcn.com/docs/installation/manual>.
2. **Add missing deps** if the component needs them (`bun add <dep>`). Base UI (`@base-ui-components/react`) is already here and is the preferred headless base; shadcn's newer registry uses it too. Icons come from `lucide-react`.
3. **Retheme onto gousse tokens.** Replace shadcn's default palette classes (`bg-background`, `text-foreground`, `border-input`, `text-muted-foreground`, `bg-accent`, `ring-ring`, …) with the gousse equivalents (`bg-gousse-panel`, `text-gousse-ink`, `border-gousse-line`, `text-gousse-muted`, `bg-gousse-line/40`, `focus-visible:ring-gousse-ink/30`, …). Under Tailwind v4 the slash-opacity modifier works natively — no `<alpha-value>` shims. Never leave a raw color or a non-token class.
4. **Reshape it round.** shadcn ships square-ish controls (`rounded-md`/`rounded-lg`); gousse leans round, so an interactive control — button, single-line field, nav row, selectable row — becomes `rounded-full`, and a surface (popover, card) takes `rounded-2xl`. Two rules travel with the pill: **widen the inset** (`px-4` on a button or text field, not `px-3`/`px-2`) because a pill eats its own horizontal padding at the ends, and add `text-center` to narrow/numeric fields. Reach for a corner instead of a pill only when a pill would eat content — `Textarea` is the standing example (`rounded-2xl`, since a tall box loses its first and last lines to the arc). Text fields take their radius from `FIELD_PILL`/`FIELD_BOX` next to `FIELD_CHROME`, not from a literal class. A native `<select>` needs the `.gousse-select` reset in `effects.css` on top — the OS ignores `border-radius` until `appearance: none` drops its painting.
5. **Watch for v4 utility renames.** The default palette classes in the shadcn source are the shadcn theme — they get rethemed as above. But if the source uses core Tailwind utilities that were renamed in v4 (e.g. v3 `shadow-sm` is v4 `shadow-xs`, v3 `outline-none` is v4 `outline-hidden` when the intent is the two-color-mode-safe focus outline), keep the v4 name.
6. **Match repo conventions**: one component (family) per `src/<name>.tsx` file, `cn()` merging `className` last, `cva` for variants, native semantics where possible (see `sidebar.tsx` for a hand-ported example, `dropdown-menu.tsx` for a Base UI wrapper).
7. **Wire it up**: export from `src/index.ts` (the barrel), and add a `src/<name>.stories.tsx` with an `AllVariants`/states story so it renders in Storybook. The registry picks the file up on its own — no manifest to edit.
8. `bun run typecheck && bun run test` — the gates.

### The token / theme contract (three coordinated CSS sheets)

Tailwind v4 CSS-first. There is **no JS preset and no `tailwind.config.ts`** — the theme is declared in CSS via `@theme`. Three sheets ship, all imported (in order) by consumers alongside a single `@import "tailwindcss"`:

1. `src/tokens.css` — raw RGB **channel** custom properties (`--gousse-bg: 249 247 244;`, `--gousse-ink`, `--gousse-shadow-*`, …) defined on `:root` and `.dark`, plus the `html { color-scheme }` block. This is the runtime knob — consumers override `--gousse-*` at any scope to rebrand. Dark mode is **class-based** and expressed in `theme.css` via `@custom-variant dark (&:where(.dark, .dark *))`. The sheet is intentionally *unlayered* so the vars are defined ahead of every consumer.
2. `src/theme.css` — Tailwind v4 `@theme` block that maps `--gousse-*` channel vars onto Tailwind theme variables (`--color-gousse-ink: rgb(var(--gousse-ink))`, `--shadow-gousse-xl: var(--gousse-shadow-xl)`, `--animate-fade-in: fadeIn 300ms ease-out forwards`, …) so every `bg-gousse-*` / `shadow-gousse-*` / `animate-*` utility resolves. v4's native slash-opacity handles `bg-gousse-ink/90` without the v3 `<alpha-value>` placeholder.
3. `src/effects.css` — plain hand-authored keyframes for `RainbowGlow`/`Sheen`. Independent of the Tailwind theme; kept unlayered.

Components reference tokens **only** through theme utilities (`text-gousse-ink`, `bg-gousse-panel`, `shadow-gousse-md`, `animate-fade-in`). Never hardcode colors. If you add a token, edit **both** `tokens.css` (both `:root` and `.dark` blocks) and `theme.css` (the `@theme` mapping).

The Storybook harness at `.storybook/preview.css` shows the canonical consumer wiring: `@import "tailwindcss"; @import "…/tokens.css"; @import "…/theme.css"; @import "…/effects.css";` and the Tailwind v4 Vite plugin (`@tailwindcss/vite`) registered in `main.ts`'s `viteFinal`. There is no `content` glob — v4 auto-detects source files.

The library ships no compiled component CSS; the three sheets are published as their own registry items (`tokens`, `theme`, `effects`).

## Distribution: the shadcn registry

The repo is **public and MIT**. Components are distributed as a shadcn registry of static JSON on GitHub Pages (<https://lucasriondel.github.io/gousse-ui>) — consumers run `npx shadcn@latest add <url>` and the *source* is copied into their tree. No package, no version to track, no credential. Consequence worth remembering: **fixing a bug here does not fix it for anyone who already installed.**

- **`scripts/build-registry.ts` generates everything from `src/`.** Item name = filename. `.tsx` → `registry:ui`, non-story `.ts` → `registry:lib` (`utils`, `field-chrome`), `.css` → `registry:file` with a `src/styles/gousse/` target. `index.ts` and `*.stories.tsx` are excluded. **There is no manifest to edit** — adding `src/foo.tsx` publishes `foo`.
- **Dependencies are derived, never declared by hand.** npm deps come from the imports a file actually makes, versioned off `package.json` (`class-variance-authority@^0.7.1`); `react`/`react-dom` are peers and stay out. Relative imports become registry dependencies *and* get rewritten to shadcn aliases (`./utils` → `@/lib/utils`) so the CLI can place files per the consumer's `components.json`. Stylesheet deps are inferred from usage: a component using a `@theme` value gets `theme` (which pulls `tokens`), one using a class `effects.css` styles as a *subject* gets `effects`.
- **Two build gates, both throwing:** every import in a shipped file must resolve to a declared npm dep, a declared registry dep, or a bundled file; and every document must validate against `scripts/registry-schema.ts` (a zod mirror of the upstream shadcn JSON Schema — re-check it against <https://ui.shadcn.com/schema/registry-item.json> if the CLI starts rejecting entries).
- `bun run build-registry` writes `registry-static/` (gitignored). `.github/workflows/pages.yml` runs typecheck → test → registry → Storybook into `registry-static/storybook` → Pages deploy on push to `main`. `REGISTRY_BASE_URL` overrides the item URLs baked into `registryDependencies`.
- **The npm package is retired.** `package.json` is `private` and nothing is published; the GitHub Packages `publishConfig` and `.npmrc` are gone. `dist/` (`build`, `copy-css`, `exports`, `files`) survives only until the last consumer of the published `0.4.1` migrates onto vendored source — treat it as legacy, not a public entry point.
- `react`/`react-dom` are **peer deps** (`^19`), never installed by the registry.
- **Legacy `dist/` details**, for as long as it survives: it is unbundled ESM (one emitted file per source file, no rollup step — hence the `.js`-extension rule), `tsc` emits JS + `.d.ts` but not `.css` so `copy-css` copies the three sheets in, only `dist/` is shipped (`files`), and stories are excluded from the build (`tsconfig.json` `exclude`). The `exports` map is `.` (barrel), `./utils`, `./tokens.css`, `./theme.css`, `./effects.css`.

## Agent skills

### Issue tracker

Issues tracked in this repo's GitHub Issues via the `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
