# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@lucasriondel/gousse-ui` — the Gousse design-system primitives (React 19 + Tailwind v4). Headless-styled components (Button, Input, Badge, Select, DropdownMenu, …), design tokens, and a CSS-first Tailwind theme (`theme.css`). Published **privately** to GitHub Packages. This repo was extracted from a monorepo; comments still reference the old `packages/web` and `packages/ui` homes.

## Commands

Uses **Bun** as the package manager.

```bash
bun install              # install deps
bun run storybook        # dev harness on :6006 — primary way to build/see components
bun run typecheck        # tsc --noEmit — the real "test"; run before committing
bun run test             # bun test — packaging smoke check only (test/dist-esm.test.ts); builds dist
bun run build            # tsc -> dist/ + copy-css; run before publishing
bun run build-storybook  # static Storybook
```

There is **no linter** (`bun run lint` is a no-op echo) and **no component unit tests** — components are validated visually in Storybook (`*.stories.tsx` next to each component). `typecheck` is the gate. `bun run test` covers exactly one thing: that the built `dist` is loadable by Node's ESM resolver (see the `.js`-extension rule below). Both run in CI (`.github/workflows/ci.yml`).

**Stories are the coverage contract: every component must have stories covering every state.** One story per meaningful state — each variant, size, `disabled`/loading/active/error/empty state, and any collapsed/expanded or open/closed mode — plus an `AllVariants`-style story showing them side by side. Adding a variant or state without a story that exercises it is incomplete work. See `button.stories.tsx` (variant + disabled + `AllVariants`) and `sidebar.stories.tsx` (`Default` + `Collapsed`).

## Architecture

- **Every primitive is one file in `src/`** with a co-located `*.stories.tsx`. `src/index.ts` is the barrel — **add each new component's export here** or consumers can't import it. Follow the existing "one component per file" convention.
- **Relative imports must carry an explicit `.js` extension** — `import { cn } from "./utils.js"`, even though the file is `utils.ts`. The package is `"type": "module"` and `tsc` emits specifiers verbatim; Node's ESM resolver does no extension guessing, so extensionless specifiers ship a `dist` that only bundlers can load. `moduleResolution` is `NodeNext`, so `typecheck` rejects a missing extension (TS2835), and `test/dist-esm.test.ts` re-checks the built output.
- **Styling is class-string based**, no CSS-in-JS. Components accept a `className` that always merges *last* via `cn()` (`src/utils.ts` — clsx + tailwind-merge, dedupes conflicts). Variants use **cva** (`class-variance-authority`); see `src/button.tsx` for the canonical pattern.
- **Shared style strings are extracted to constants** so related components can't drift: `src/field-chrome.ts` (`FIELD_CHROME`, shared by Input/Textarea), and `POPUP_*`/`ITEM_*` consts inside `dropdown-menu.tsx`. Reuse these rather than re-typing chrome.
- **Interactive/popover components wrap Base UI** (`@base-ui-components/react`) in shadcn-flavoured wrappers, restyled with gousse tokens (see `dropdown-menu.tsx`). Simple form controls wrap the **native** element (see `select.tsx`) to keep OS semantics.
- Icons: `lucide-react`.

### Adding a new component ported from shadcn/ui

The shadcn CLI (`npx shadcn@latest add <name>`) does **not** fit this repo — it targets a `components/ui/` + `lib/utils` alias layout defined in a `components.json`, which we don't use. **Port manually** instead, adapting to gousse conventions:

1. **Get the source.** Read it on the docs site (<https://ui.shadcn.com/docs/components/<name>>), or fetch the raw JSON from the registry: `https://ui.shadcn.com/r/styles/default/<name>.json` (the `files[].content` field holds the component source). Reference: <https://ui.shadcn.com/docs/cli> and <https://ui.shadcn.com/docs/installation/manual>.
2. **Add missing deps** if the component needs them (`bun add <dep>`). Base UI (`@base-ui-components/react`) is already here and is the preferred headless base; shadcn's newer registry uses it too. Icons come from `lucide-react`.
3. **Retheme onto gousse tokens.** Replace shadcn's default palette classes (`bg-background`, `text-foreground`, `border-input`, `text-muted-foreground`, `bg-accent`, `rounded-lg`, `ring-ring`, …) with the gousse equivalents (`bg-gousse-panel`, `text-gousse-ink`, `border-gousse-line`, `text-gousse-muted`, `bg-gousse-line/40`, `rounded-xl`, `focus-visible:ring-gousse-ink/30`, …). Under Tailwind v4 the slash-opacity modifier works natively — no `<alpha-value>` shims. Never leave a raw color or a non-token class.
4. **Watch for v4 utility renames.** The default palette classes in the shadcn source are the shadcn theme — they get rethemed as above. But if the source uses core Tailwind utilities that were renamed in v4 (e.g. v3 `shadow-sm` is v4 `shadow-xs`, v3 `outline-none` is v4 `outline-hidden` when the intent is the two-color-mode-safe focus outline), keep the v4 name.
5. **Match repo conventions**: one component (family) per `src/<name>.tsx` file, `cn()` merging `className` last, `cva` for variants, native semantics where possible (see `sidebar.tsx` for a hand-ported example, `dropdown-menu.tsx` for a Base UI wrapper).
6. **Wire it up**: export from `src/index.ts` (the barrel), and add a `src/<name>.stories.tsx` with an `AllVariants`/states story so it renders in Storybook.
7. `bun run typecheck` — the gate.

### The token / theme contract (three coordinated CSS sheets)

Tailwind v4 CSS-first. There is **no JS preset and no `tailwind.config.ts`** — the theme is declared in CSS via `@theme`. Three sheets ship, all imported (in order) by consumers alongside a single `@import "tailwindcss"`:

1. `src/tokens.css` — raw RGB **channel** custom properties (`--gousse-bg: 249 247 244;`, `--gousse-ink`, `--gousse-shadow-*`, …) defined on `:root` and `.dark`, plus the `html { color-scheme }` block. This is the runtime knob — consumers override `--gousse-*` at any scope to rebrand. Dark mode is **class-based** and expressed in `theme.css` via `@custom-variant dark (&:where(.dark, .dark *))`. The sheet is intentionally *unlayered* so the vars are defined ahead of every consumer.
2. `src/theme.css` — Tailwind v4 `@theme` block that maps `--gousse-*` channel vars onto Tailwind theme variables (`--color-gousse-ink: rgb(var(--gousse-ink))`, `--shadow-gousse-xl: var(--gousse-shadow-xl)`, `--animate-fade-in: fadeIn 300ms ease-out forwards`, …) so every `bg-gousse-*` / `shadow-gousse-*` / `animate-*` utility resolves. v4's native slash-opacity handles `bg-gousse-ink/90` without the v3 `<alpha-value>` placeholder.
3. `src/effects.css` — plain hand-authored keyframes for `RainbowGlow`/`Sheen`. Independent of the Tailwind theme; kept unlayered.

Components reference tokens **only** through theme utilities (`text-gousse-ink`, `bg-gousse-panel`, `shadow-gousse-md`, `animate-fade-in`). Never hardcode colors. If you add a token, edit **both** `tokens.css` (both `:root` and `.dark` blocks) and `theme.css` (the `@theme` mapping).

The Storybook harness at `.storybook/preview.css` shows the canonical consumer wiring: `@import "tailwindcss"; @import "…/tokens.css"; @import "…/theme.css"; @import "…/effects.css";` and the Tailwind v4 Vite plugin (`@tailwindcss/vite`) registered in `main.ts`'s `viteFinal`. There is no `content` glob — v4 auto-detects source files.

The library ships no compiled component CSS; only `tokens.css` / `theme.css` / `effects.css` are shipped.

## Build & publish specifics

- `dist` is **unbundled ESM** — one emitted file per source file, no rollup step. That makes the `.js`-extension rule above load-bearing: nothing rewrites specifiers between `src/` and `dist/`.
- `tsc` emits JS + `.d.ts` to `dist/` but **does not emit `.css`** — the `copy-css` script copies `tokens.css`, `theme.css`, and `effects.css` in. Both run via `build`.
- `package.json` `exports` map: `.` (barrel), `./utils`, `./tokens.css`, `./theme.css`, `./effects.css`. The v3-era `./preset` entry point was **removed** in v0.3.0 when the JS preset was replaced by the CSS-first `theme.css`. **Update `exports` when adding a new public entry point.**
- Only `dist/` is shipped (`files`). Stories are excluded from the build (`tsconfig.json` `exclude`).
- Publishing needs a **classic** PAT with `write:packages` in `NODE_AUTH_TOKEN` (fine-grained tokens don't work for GitHub Packages npm). `.npmrc` is token-less by design — token comes from the env. `prepublishOnly` runs the build. See README for the full flow.
- `react`/`react-dom` are **peer deps** (`^19`), not bundled.

## Agent skills

### Issue tracker

Issues tracked in this repo's GitHub Issues via the `gh` CLI; external PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles use their default label strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
