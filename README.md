# @lucasriondel/gousse-ui

Gousse design-system primitives (React 19 + Tailwind v4). Published **privately** to
[GitHub Packages](https://docs.github.com/en/packages).

## Installing (consumers)

GitHub Packages serves private packages only with an authenticated token, so every
machine that installs this needs two things: a scope→registry map and a token.

### 1. Create a GitHub token

Classic Personal Access Token with the **`read:packages`** scope:
<https://github.com/settings/tokens/new?scopes=read:packages>

(Fine-grained tokens do **not** work for GitHub Packages npm reads — use a classic PAT.)

### 2. Point the `@lucasriondel` scope at GitHub Packages

Add an `.npmrc` in the consuming project (or `~/.npmrc` for all projects):

```ini
@lucasriondel:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then export the token in your shell / CI env — never inline it in a committed file:

```bash
export NODE_AUTH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

### 3. Install

```bash
bun add @lucasriondel/gousse-ui
# or: npm i @lucasriondel/gousse-ui
```

Bun reads `.npmrc` and interpolates `${NODE_AUTH_TOKEN}` from the environment.

## Usage

Requires Tailwind CSS **v4** (`tailwindcss@^4.3`). The kit ships a CSS-first theme
(`theme.css`) that consumers `@import` next to Tailwind — there is no JS preset and
no `tailwind.config.ts` any more.

Import the components you need from the barrel:

```ts
import { Button, Badge, Spinner } from "@lucasriondel/gousse-ui";
```

Wire the theme in your app's entry stylesheet (order matters — tokens define the
`--gousse-*` channel vars, `theme.css` maps them onto Tailwind theme variables):

```css
@import "tailwindcss";
@import "@lucasriondel/gousse-ui/tokens.css";  /* --gousse-* channel vars (:root/.dark) */
@import "@lucasriondel/gousse-ui/theme.css";   /* @theme mapping → bg-gousse-*, shadow-gousse-*, animate-* */
@import "@lucasriondel/gousse-ui/effects.css"; /* rainbow-glow / sheen keyframes */
```

Dark mode is **class-based** (`.dark` on `<html>`) and expressed by `theme.css`'s
`@custom-variant dark`; flip `<html class="dark">` from your own toggle. `react` /
`react-dom` are peer deps (`^19`) — the consumer provides them.

## Changelog

### 0.4.1 — `dist` is valid Node ESM

`dist` ships as `"type": "module"` but emitted extensionless relative specifiers
(`from "./utils"`), which Node's ESM resolver rejects. Importing the package off
the bundler path (plain `node`, Vitest, SSR) failed with `ERR_MODULE_NOT_FOUND`.

- Every relative import in `src/` now carries an explicit `.js` extension, so
  `tsc` emits fully-resolvable specifiers. No API or visual change.
- `moduleResolution` is now `NodeNext`, so `bun run typecheck` fails on a
  reintroduced extensionless import.
- Consumers who inlined the package to work around this (e.g. Vitest
  `server.deps.inline`) can drop that workaround.

### 0.3.0 — Tailwind v4 CSS-first theme (breaking)

Migrated the kit to Tailwind v4 and replaced the JS preset with a CSS-first theme
sheet. **This is a breaking change for the theming entry point.**

- **Removed** the `@lucasriondel/gousse-ui/preset` public entry point and the
  `goussePreset` JS export. Under Tailwind v4 there is no `presets: [...]` config
  to spread into.
- **Added** `@lucasriondel/gousse-ui/theme.css`. Consumers replace
  `presets: [goussePreset]` with `@import "@lucasriondel/gousse-ui/theme.css"` in
  their entry stylesheet (see **Usage** above).
- Requires `tailwindcss@^4.3`. If you were on Tailwind v3, upgrade first
  (<https://tailwindcss.com/docs/upgrade-guide>).
- The `--gousse-*` runtime tokens, class-based `.dark` mode, and every
  `bg-gousse-*` / `shadow-gousse-*` / `animate-*` utility are preserved.
  Component visuals are unchanged.
- `react` / `react-dom` remain `^19` peer dependencies.

## Publishing (maintainer)

Requires a classic PAT with **`write:packages`** (and `read:packages`).

```bash
cd packages/ui
export NODE_AUTH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
npm version patch          # bump 0.1.0 -> 0.1.1 (or minor/major)
npm publish                # prepublishOnly runs the build (tsc + copy-css)
# bun publish works too — exports already point at dist/ in package.json.
```

Notes:
- `main`/`exports` point at `dist/` (compiled JS + `.d.ts`). In-repo, **web** consumes
  ui *source* for hot-reload via a Vite alias in `packages/web/vite.config.ts`, and
  `turbo typecheck` depends on `^build` so ui is built before web typechecks.
- Only `dist/` is shipped (see `files`). CSS is copied into `dist/` by `copy-css`
  because `tsc` alone does not emit `.css`.
- The committed `.npmrc` is token-less: the token comes from `${NODE_AUTH_TOKEN}` in
  the environment. Never inline a token into a committed file.
