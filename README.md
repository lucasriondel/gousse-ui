# @lucasriondel/gousse-ui

Gousse design-system primitives (React 19 + Tailwind 3). Published **privately** to
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

```ts
import { Button, Badge, Spinner } from "@lucasriondel/gousse-ui";
import { goussePreset } from "@lucasriondel/gousse-ui/preset"; // tailwind preset
import "@lucasriondel/gousse-ui/tokens.css";  // CSS custom properties
import "@lucasriondel/gousse-ui/effects.css"; // rainbow-glow / sheen keyframes
```

Tailwind config:

```ts
import { goussePreset } from "@lucasriondel/gousse-ui/preset";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [goussePreset],
  darkMode: "class",
};
```

`react` / `react-dom` are peer deps (`^19`) — the consumer provides them.

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
