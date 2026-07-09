# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`@lucasriondel/gousse-ui` — the Gousse design-system primitives (React 19 + Tailwind 3). Headless-styled components (Button, Input, Badge, Select, DropdownMenu, …), design tokens, and a Tailwind preset. Published **privately** to GitHub Packages. This repo was extracted from a monorepo; comments still reference the old `packages/web` and `packages/ui` homes.

## Commands

Uses **Bun** as the package manager.

```bash
bun install              # install deps
bun run storybook        # dev harness on :6006 — primary way to build/see components
bun run typecheck        # tsc --noEmit — the real "test"; run before committing
bun run build            # tsc -> dist/ + copy-css; run before publishing
bun run build-storybook  # static Storybook
```

There is **no test runner and no linter** (`bun run lint` is a no-op echo). `typecheck` is the gate. There are no unit tests — components are validated visually in Storybook (`*.stories.tsx` next to each component).

**Stories are the coverage contract: every component must have stories covering every state.** One story per meaningful state — each variant, size, `disabled`/loading/active/error/empty state, and any collapsed/expanded or open/closed mode — plus an `AllVariants`-style story showing them side by side. Adding a variant or state without a story that exercises it is incomplete work. See `button.stories.tsx` (variant + disabled + `AllVariants`) and `sidebar.stories.tsx` (`Default` + `Collapsed`).

## Architecture

- **Every primitive is one file in `src/`** with a co-located `*.stories.tsx`. `src/index.ts` is the barrel — **add each new component's export here** or consumers can't import it. Follow the existing "one component per file" convention.
- **Styling is class-string based**, no CSS-in-JS. Components accept a `className` that always merges *last* via `cn()` (`src/utils.ts` — clsx + tailwind-merge, dedupes conflicts). Variants use **cva** (`class-variance-authority`); see `src/button.tsx` for the canonical pattern.
- **Shared style strings are extracted to constants** so related components can't drift: `src/field-chrome.ts` (`FIELD_CHROME`, shared by Input/Textarea), and `POPUP_*`/`ITEM_*` consts inside `dropdown-menu.tsx`. Reuse these rather than re-typing chrome.
- **Interactive/popover components wrap Base UI** (`@base-ui-components/react`) in shadcn-flavoured wrappers, restyled with gousse tokens (see `dropdown-menu.tsx`). Simple form controls wrap the **native** element (see `select.tsx`) to keep OS semantics.
- Icons: `lucide-react`.

### Adding a new component ported from shadcn/ui

The shadcn CLI (`npx shadcn@latest add <name>`) does **not** fit this repo — it targets a `components/ui/` + `lib/utils` alias layout defined in a `components.json`, which we don't use. **Port manually** instead, adapting to gousse conventions:

1. **Get the source.** Read it on the docs site (<https://ui.shadcn.com/docs/components/<name>>), or fetch the raw JSON from the registry: `https://ui.shadcn.com/r/styles/default/<name>.json` (the `files[].content` field holds the component source). Reference: <https://ui.shadcn.com/docs/cli> and <https://ui.shadcn.com/docs/installation/manual>.
2. **Add missing deps** if the component needs them (`bun add <dep>`). Base UI (`@base-ui-components/react`) is already here and is the preferred headless base; shadcn's newer registry uses it too. Icons come from `lucide-react`.
3. **Retheme onto gousse tokens.** Replace shadcn's default palette classes (`bg-background`, `text-foreground`, `border-input`, `text-muted-foreground`, `bg-accent`, `rounded-lg`, `ring-ring`, …) with the gousse equivalents (`bg-gousse-panel`, `text-gousse-ink`, `border-gousse-line`, `text-gousse-muted`, `bg-gousse-line/40`, `rounded-xl`, `focus-visible:ring-gousse-ink/30`, …). Never leave a raw color or a non-token class.
4. **Match repo conventions**: one component (family) per `src/<name>.tsx` file, `cn()` merging `className` last, `cva` for variants, native semantics where possible (see `sidebar.tsx` for a hand-ported example, `dropdown-menu.tsx` for a Base UI wrapper).
5. **Wire it up**: export from `src/index.ts` (the barrel), and add a `src/<name>.stories.tsx` with an `AllVariants`/states story so it renders in Storybook.
6. `bun run typecheck` — the gate.

### The token / theme contract (three coordinated pieces)

1. `src/tokens.css` — CSS custom properties (`--gousse-bg`, `--gousse-ink`, shadows, …) defined on `:root` and `.dark`. Dark mode is **class-based** (`darkMode: "class"`). This file is intentionally *unlayered* (imported standalone, ahead of `@tailwind base`).
2. `src/preset.ts` (`goussePreset`) — a **partial** Tailwind preset mapping those vars to utilities (`bg-gousse-panel`, `shadow-gousse-xl`, animations/keyframes). It deliberately omits `content`/`darkMode`/`plugins` — the **consumer** provides those.
3. `src/effects.css` — keyframes for `RainbowGlow`/`Sheen`.

Components reference tokens **only** through preset utilities (`text-gousse-ink`, `bg-gousse-panel`). Never hardcode colors. If you add a token, edit both `tokens.css` (both `:root` and `.dark`) and `preset.ts`.

`tailwind.config.ts` at the root is **Storybook-only** — it spreads `goussePreset` so primitives render in isolation. The library ships no compiled component CSS; only `tokens.css`/`effects.css` are shipped.

## Build & publish specifics

- `tsc` emits JS + `.d.ts` to `dist/` but **does not emit `.css`** — the `copy-css` script copies `tokens.css`/`effects.css` in. Both run via `build`.
- `package.json` `exports` map: `.` (barrel), `./utils`, `./preset`, `./tokens.css`, `./effects.css`. **Update `exports` when adding a new public entry point.**
- Only `dist/` is shipped (`files`). Stories are excluded from the build (`tsconfig.json` `exclude`).
- Publishing needs a **classic** PAT with `write:packages` in `NODE_AUTH_TOKEN` (fine-grained tokens don't work for GitHub Packages npm). `.npmrc` is token-less by design — token comes from the env. `prepublishOnly` runs the build. See README for the full flow.
- `react`/`react-dom` are **peer deps** (`^19`), not bundled.
