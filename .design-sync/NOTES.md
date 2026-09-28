# design-sync notes — gousse-ui

Repo-specific findings for future syncs. Read this before running the driver.

## Fresh-clone setup (do these before the driver)

```sh
bun install --frozen-lockfile
bun run build                                  # tsc -> dist/ (the converter bundles dist/, not src/)
npx storybook build -c .storybook -o "$(git rev-parse --show-toplevel)/.design-sync/sb-reference"
npx @tailwindcss/cli -i .design-sync/ds-css-entry.css -o .design-sync/.cache/ds-styles.css
mkdir -p .ds-sync && cp -r "<skill-base-dir>"/{package-build.mjs,package-validate.mjs,resync.mjs,lib,storybook,non-storybook} .ds-sync/
echo '{"name":"ds-sync-deps","private":true}' > .ds-sync/package.json
(cd .ds-sync && npm i esbuild ts-morph @types/react playwright && npx playwright install chromium)
```

Driver:
`node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./dist/index.js --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`

## Setup facts

- Shape: `storybook`. Config dir `.storybook/`, stories `src/**/*.stories.@(ts|tsx)`.
- This repo IS the package's own source, so `node_modules/@lucasriondel/gousse-ui`
  does not exist. The converter needs `--entry ./dist/index.js` and
  `--node-modules ./node_modules`. Run `bun run build` first (tsc → `dist/` +
  `copy-css`) — the converter bundles `dist/`, not `src/`.
- Story titles (`Primitives/Button`, `Effects/RainbowGlow`) map cleanly onto
  export names, so **no `titleMap` is needed**. 53 stories / 16 components,
  53/53 paired automatically.

## Findings

- `[GENERAL]` `! preview decorator bundle failed: Could not resolve "tailwindcss"`
  → `.storybook/preview.ts` imports `preview.css`, which starts with
  `@import "tailwindcss"` (Tailwind v4 CSS-first); esbuild can't resolve that
  bare specifier when bundling the decorator chain. **Harmless here**: the only
  decorator is `withThemeByClassName` with `defaultTheme: "light"`, i.e. it adds
  no class in light mode — which is exactly what previews render. Verified by the
  solo phase (Button/Avatar/DropdownMenu/Sidebar all `match` without it).
  Do NOT "fix" this by setting `cfg.provider` unless dark-mode previews are
  wanted — a provider replaces the decorators wholesale and would need
  re-verification.
- `[GENERAL]` **The scraped storybook CSS is not enough — we compile our own.**
  There is no compiled component CSS in `dist/` (the library ships three
  hand-authored sheets and the consumer runs Tailwind), so the converter's
  default is `[CSS_FROM_STORYBOOK]`: scrape the stylesheet out of
  `.design-sync/sb-reference`. That output is Tailwind's **content-scanned result
  for the stories only** — measured at 317 classes. Utilities the stories happen
  not to use were absent: `bg-gousse-muted`, `bg-gousse-medium/low`,
  every `border-gousse-*` except `line`, ALL `ring-gousse-*`, `shadow-gousse-lg`,
  and 5 of the 7 `animate-*` keyframes.
  That renders the components fine, but claude.ai/design's agent writes its own
  layout glue with these utilities, and anything outside the scanned set renders
  **silently unstyled**. Fix: `.design-sync/ds-css-entry.css` imports the real
  sheets plus an `@source inline(...)` safelist of the full `gousse-*` matrix,
  compiled via `npx @tailwindcss/cli` to `.design-sync/.cache/ds-styles.css` and
  wired in as `cfg.cssEntry`. Result: 979 classes, every token/animation/shadow
  documented in `conventions.md` resolves.
  **Rebuild command (re-run whenever tokens/theme/effects change):**
  `npx @tailwindcss/cli -i .design-sync/ds-css-entry.css -o .design-sync/.cache/ds-styles.css`
  **Trap already hit once: `ds-css-entry.css` must import exactly the sheets
  `.storybook/preview.css` imports — no more.** An early version also imported
  `src/sidebar-chrome.css`. Nothing in the library or the harness imports that
  file (`sidebar.tsx` only mentions it in comments), so including it painted
  active-row and hue styling the real components never show: Sidebar's `Inbox`
  and `Settings` rows rendered with peach pill backgrounds and the category icons
  went blue/green/purple, against a plain storybook reference. The spot-check
  after the CSS swap is what caught it — **always re-verify a themed component
  after touching `cssEntry`**, since carried grades will not.
- `[GRID_OVERFLOW] wide` on Empty, Select, Textarea → these render wider than a
  grid cell. Fixed with `cfg.overrides.<Name>.cardMode: "column"`. Presentation
  only; grades carry.
- `[GENERAL]` **Small primitives are unjudgeable from the sheet — use `compare/raw/`.**
  The sheet scales each shot into a ~480px cell, so a 16px checkbox, a 1px
  separator hairline, or a switch knob becomes a few grey pixels. Judge those from
  `compare/raw/*__sb.png` / `*__ds.png` at magnification. Note the two sides crop
  differently: `__sb.png` is tight-cropped to the component (e.g. 868x20) while
  `__ds.png` is the full 900x700 preview frame with content inset at roughly
  x=25,y=32 — align for that offset before concluding anything about position.
- `[GENERAL]` Storybook canvas paints cream (`#f7f6f3`), the preview frame paints
  white. Every story shows this. Pure framing — grade `match`.
- **Repo finding (not a sync issue): `Checkbox`'s accent token is inert.**
  `src/checkbox.tsx` is a raw `<input type="checkbox">` with
  `h-4 w-4 rounded border-gousse-line text-gousse-accent` and **no
  `appearance-none` reset**, so the browser paints its own OS control and
  `text-gousse-accent` never lands — both panels render the blue native checkbox.
  It syncs faithfully and needs no design-sync fix, but the component does not
  actually use its gousse accent. Worth fixing upstream (compare `select.tsx`,
  which needs the `.gousse-select` reset in `effects.css` for the same reason).
- RadioGroup: the story's `useState` lives inside `render`, which the generated
  composer invokes as a plain function rather than mounting as a component. This
  does NOT break static capture — the initial selection and row styling match
  exactly. Only interaction would expose it.
- `[GENERAL]` **Judge the component box, not its offset from the canvas edge.**
  Storybook crops its canvas to content height, so the component sits flush at the
  top-left; the preview renders it inset in the full capture viewport. This shows
  up on *every* component, fullscreen or not. It is framing, never a delta.
- `[GENERAL]` **`effects.css` is verified end-to-end.** RainbowGlow and Sheen paint
  their keyframes/gradients on both panels (rainbow halo on `Pill Active`/`Card`,
  sheen highlight on `Default`/`On Card`) and the stabilized frames agree — the
  effect sheet survives the compiled bundle intact.
- Spinner: the arc's rotation phase differs a few degrees between panels — each
  side stabilizes the spin to a settled frame independently. Not a styling delta.
- `[GENERAL]` Storybook page-filler divs are not component markup. Several stories
  (Sidebar especially) wrap the component next to a `flex-1` filler div and set
  `parameters.layout: "fullscreen"`. In storybook that filler spans the viewport
  and paints a large cream panel; in the narrower preview frame it collapses to
  its own text. **This is framing, not a component delta — grade `match`.** The
  filler's text content renders on both sides; check that rather than the fill area.

## Re-sync risks

- **`.design-sync/.cache/ds-styles.css` is a build artifact in a gitignored dir.**
  `cfg.cssEntry` points at it, but `.design-sync/.cache/` is gitignored, so on a
  fresh clone it does not exist and the build will fall back or fail. Re-run the
  `@tailwindcss/cli` command in the CSS finding above as part of fresh-clone setup
  (the committed `ds-css-entry.css` is the durable input; the compiled file is not).
- **The `@source inline(...)` safelist must track `theme.css`.** If a token,
  shadow, or animation is added to the `@theme` block, add it to
  `.design-sync/ds-css-entry.css` too — otherwise it is documented in
  `conventions.md` but absent from the shipped CSS, which is exactly the failure
  the safelist exists to prevent.
- **The sb-reference is still the comparison oracle** even though it is no longer
  the CSS source. A re-sync that rebuilds `dist/` but not
  `.design-sync/sb-reference` grades against a stale render of the old design —
  the driver's `[REFERENCE_STALE?]` warn catches it if you forget.
- The decorator-bundle failure is **recorded as accepted, not fixed**. If a future
  sync wants dark-mode previews, that requires `cfg.provider` plus a full
  re-verification — the carried-forward grades were earned in light mode only.
- `@base-ui-components/react` is pinned to a release candidate (`1.0.0-rc.0`).
  A version bump can move popover/menu rendering (DropdownMenu, Select) without
  touching this repo's own source — treat a bump as a reason to re-verify those
  two rather than trusting carried grades.
- DropdownMenu's only story renders the **closed** trigger. The open menu surface
  (`POPUP_*`/`ITEM_*` styling in `dropdown-menu.tsx`) is therefore **never
  visually verified by this sync**. Adding an open-state story would close that gap.
