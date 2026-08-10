import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  REGISTRY_ITEM_SCHEMA_URL,
  REGISTRY_SCHEMA_URL,
  registryItemSchema,
  registrySchema,
  type Registry,
  type RegistryItem,
  type RegistryItemFile,
} from "./registry-schema.js";

/**
 * Generates the gousse-ui shadcn registry from `src/`.
 *
 * Nothing here is hand-maintained: item names come from filenames, npm
 * dependencies from the imports each file actually makes (versioned off
 * package.json), registry dependencies from the relative imports and the
 * design-token/effect classes the source uses. Adding `src/foo.tsx` is enough
 * to publish `foo` — see `docs/agents/domain.md` for the wider contract.
 *
 * Two gates run before anything is written, and both throw rather than warn:
 *   1. every import in every shipped file resolves to a declared dependency,
 *      a declared registry dependency, or a file bundled in the same item;
 *   2. every document validates against the shadcn registry schema.
 */

export const ROOT_DIR = join(import.meta.dir, "..");
export const SRC_DIR = join(ROOT_DIR, "src");
export const OUT_DIR = join(ROOT_DIR, "registry-static");

export const REGISTRY_NAME = "gousse-ui";
export const DEFAULT_BASE_URL = "https://lucasriondel.github.io/gousse-ui";
export const AUTHOR = "lucasriondel <https://github.com/lucasriondel>";

/** Where a consumer's stylesheets land. They own the files and can move them. */
const CSS_TARGET_DIR = "src/styles/gousse";

const pkg = JSON.parse(readFileSync(join(ROOT_DIR, "package.json"), "utf8")) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};

/** Provided by the consumer's app, never installed by the registry. */
export const PEER_DEPENDENCIES: Record<string, string> = pkg.peerDependencies;

const NPM_VERSIONS: Record<string, string> = pkg.dependencies;

// ---------------------------------------------------------------------------
// source parsing
// ---------------------------------------------------------------------------

/**
 * Drop comments so a `from "…"` inside prose is not mistaken for an import.
 *
 * Scanned rather than regexed: a `//` inside a string literal (`"//cdn.x/a"`)
 * or a regex literal is not a comment, and treating it as one would delete the
 * rest of the line — hiding real imports and class strings from both gates.
 *
 * Comment bodies blank out to spaces rather than vanishing, keeping the result
 * the same length as the input (newlines survive too). `rewriteImports` maps
 * match offsets straight back onto the original source, so that must hold.
 */
function stripComments(source: string): string {
  let out = "";
  let i = 0;

  /** True when the previous token allows a regex literal rather than division. */
  const regexAllowedHere = (): boolean => {
    const before = out.replace(/\s+$/, "");
    if (!before) return true;
    const last = before[before.length - 1]!;
    if ("([{,;:=!&|?+-*%~^<>".includes(last)) return true;
    return /\b(return|typeof|instanceof|in|of|new|delete|void|do|else|case|yield|await)$/.test(
      before,
    );
  };

  while (i < source.length) {
    const ch = source[i]!;
    const next = source[i + 1];

    if (ch === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const body = end === -1 ? source.slice(i) : source.slice(i, end + 2);
      out += body.replace(/[^\n]/g, " "); // blank the prose, keep the newlines
      i = end === -1 ? source.length : end + 2;
      continue;
    }

    if (ch === "/" && next === "/") {
      const end = source.indexOf("\n", i);
      const body = end === -1 ? source.slice(i) : source.slice(i, end);
      out += " ".repeat(body.length);
      i = end === -1 ? source.length : end;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      out += ch;
      i += 1;
      while (i < source.length) {
        const c = source[i]!;
        out += c;
        i += 1;
        if (c === "\\") {
          if (i < source.length) {
            out += source[i]!;
            i += 1;
          }
          continue;
        }
        if (c === ch) break;
      }
      continue;
    }

    if (ch === "/" && regexAllowedHere()) {
      // A regex literal: consume it whole so a `//`-looking body (or a `"` in a
      // character class) cannot desynchronise the scan.
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < source.length) {
        const c = source[j]!;
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "\n") break; // unterminated — not a regex after all
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          closed = true;
          j += 1;
          break;
        }
        j += 1;
      }
      if (closed) {
        out += source.slice(i, j);
        i = j;
        continue;
      }
    }

    out += ch;
    i += 1;
  }

  return out;
}

/** The three shapes a module specifier appears in. Each captures the quoted
 *  specifier in group 1, so one pass can both read and rewrite them. */
const IMPORT_PATTERNS = [
  /\bfrom\s*["']([^"']+)["']/g,
  /\bimport\s+["']([^"']+)["']/g,
  /\bimport\s*\(\s*["']([^"']+)["']/g,
];

/** Every module specifier a file pulls in: static, side-effect, and dynamic. */
export function extractImports(source: string): string[] {
  const code = stripComments(source);
  const specs: string[] = [];
  for (const re of IMPORT_PATTERNS) {
    for (const m of code.matchAll(re)) specs.push(m[1]!);
  }
  return [...new Set(specs)];
}

/**
 * Rewrite module specifiers in place, leaving every other occurrence of the
 * same string alone: a `"./utils.js"` in a JSDoc `@example` or a runtime path
 * is not an import and must survive verbatim into the consumer's tree.
 *
 * Matching runs against the comment-stripped source so prose can never be
 * rewritten, but the offsets index the original — `stripComments` preserves
 * length for everything except comment bodies, which are never import sites.
 */
export function rewriteImports(source: string, rename: (spec: string) => string | null): string {
  const code = stripComments(source);
  const edits: Array<{ start: number; end: number; text: string }> = [];

  for (const re of IMPORT_PATTERNS) {
    for (const m of code.matchAll(re)) {
      const replacement = rename(m[1]!);
      if (replacement === null) continue;
      // Offset of the specifier itself, not of the whole `from "…"` match.
      const quoteOffset = m[0]!.indexOf(m[1]!);
      const start = m.index! + quoteOffset;
      edits.push({ start, end: start + m[1]!.length, text: replacement });
    }
  }

  edits.sort((a, b) => b.start - a.start); // right-to-left keeps earlier offsets valid
  let out = source;
  for (const edit of edits) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  return out;
}

/** `@base-ui-components/react/menu` -> `@base-ui-components/react`, and any
 *  `pkg@range` suffix is stripped so declared deps round-trip. */
export function npmPackageName(spec: string): string {
  const parts = spec.split("/");
  const base = spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
  const at = base.lastIndexOf("@");
  return at > 0 ? base.slice(0, at) : base;
}

/** `@/lib/utils` / `@/components/ui/button` -> the registry item they name. */
export function itemNameFromAliasImport(spec: string): string | null {
  if (!spec.startsWith("@/")) return null;
  return spec.split("/").pop()!.replace(/\.(tsx?|css)$/, "");
}

function docSentence(body: string): string | undefined {
  const text = body
    .split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, "").trim())
    .join(" ")
    .replace(/\{@link\s+([^}]+)\}/g, "$1") // jsdoc markup is noise in a registry listing
    .replace(/\s+/g, " ")
    .replace(/^[=\s-]+/, "")
    .trim();
  if (!text) return undefined;
  const end = text.search(/\.(\s|$)/);
  const sentence = end === -1 ? text : text.slice(0, end + 1);
  return sentence.length > 240 ? `${sentence.slice(0, 237)}…` : sentence;
}

/**
 * The one-line description a browsing consumer sees, taken from the source so
 * there is no second place to keep it current. Uses the first *module-level*
 * doc comment: indented ones document a prop or a branch of the file, and the
 * one that opens the module is the one that says what the module is.
 */
export function describeModule(source: string): string | undefined {
  const blocks = [...source.matchAll(/(?:^|\n)([ \t]*)\/\*\*?([\s\S]*?)\*\//g)];
  const moduleLevel = blocks.find((b) => b[1] === "");
  return docSentence((moduleLevel ?? blocks[0])?.[2] ?? "");
}

function titleCase(name: string): string {
  return name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * The class strings a component actually renders with. Stylesheet inference
 * reads this rather than the whole module: an identifier, a union member, or
 * JSX text that happens to equal a class name (`type T = "dark"`) is not a use
 * of that class, and treating it as one drags an unwanted sheet along.
 *
 * Deliberately loose about *which* strings — every string literal reachable
 * from a `className`/`class`/`cva`/`cn` position, plus template literals, since
 * variant maps and extracted chrome constants are all just strings.
 */
export function extractClassStrings(source: string): string {
  // A `type X = "dark" | "light"` alias names variants, it does not apply a
  // class — so it must not read as a use of the `.dark` rule tokens.css owns.
  // Only the alias form is stripped: a `key: "…"` inside a cva variants map has
  // the same shape as a property signature and carries real class strings.
  const code = stripComments(source).replace(/\btype\s+\w+\s*=[^;]*;/g, "");

  const pieces: string[] = [];
  for (const m of code.matchAll(/"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g)) {
    pieces.push(m[1] ?? m[2] ?? m[3] ?? "");
  }
  return pieces.join("\n");
}

/**
 * Match a Tailwind theme value / CSS class inside a class string.
 *
 * The left boundary stays asymmetric on purpose: a `-` before the token is the
 * normal case, because that is the utility prefix (`bg-gousse-ink`,
 * `shadow-gousse-xl`). Only the HTML attribute namespaces get excluded, since
 * `data-gousse-ink` and `aria-*` are names of their own rather than utilities.
 *
 * The right boundary excludes `:` on top of the word characters, so Tailwind's
 * `dark:bg-black` variant does not read as a use of the `.dark` class that
 * tokens.css happens to define.
 */
function usesClass(source: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const notAttribute = String.raw`(?<!\bdata-)(?<!\baria-)`;
  return new RegExp(`(?<![A-Za-z0-9_])${notAttribute}${escaped}(?![A-Za-z0-9_:-])`).test(source);
}

/** Comments in these sheets name classes and vars they don't actually define
 *  (`.ai-glow`, `rgb(var(--gousse-*))`) — parse the rules, not the prose. */
function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/**
 * The classes a sheet *gives* you — the subject of each rule, i.e. the last
 * compound in the selector. Ancestor compounds (`.group` in
 * `.group:hover .gousse-sheen`) are hooks the consumer already provides, so a
 * component merely using Tailwind's `group` must not be pulled onto the sheet.
 */
function cssSubjectClasses(css: string): string[] {
  const names = new Set<string>();
  for (const rule of stripCssComments(css).matchAll(/(?:^|[{}])([^{}]*)\{/g)) {
    const prelude = rule[1]!.trim();
    if (!prelude || prelude.startsWith("@")) continue;
    for (const selector of prelude.split(",")) {
      const subject = selector.trim().split(/\s*[>+~]\s*|\s+/).filter(Boolean).pop();
      if (!subject) continue;
      for (const cls of subject.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) names.add(cls[1]!);
    }
  }
  return [...names];
}

/** Custom properties a sheet *defines* vs the ones it only *references*. */
function cssCustomProperties(css: string): { defined: Set<string>; referenced: Set<string> } {
  const rules = stripCssComments(css);
  const defined = new Set([...rules.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]!));
  const referenced = new Set([...rules.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]!));
  return { defined, referenced };
}

/** Per-sheet property sets, parsed once. Ownership lookups happen per
 *  referenced var across every sheet, which re-parses the same text otherwise. */
const sheetPropertyCache = new WeakMap<
  SourceFile,
  { defined: Set<string>; referenced: Set<string> }
>();

function sheetProperties(sheet: SourceFile): { defined: Set<string>; referenced: Set<string> } {
  let parsed = sheetPropertyCache.get(sheet);
  if (!parsed) {
    parsed = cssCustomProperties(sheet.content);
    sheetPropertyCache.set(sheet, parsed);
  }
  return parsed;
}

/** Tailwind theme values declared in `@theme` reduced to the fragment that
 *  shows up in a class string: `--color-gousse-ink` -> `gousse-ink`. */
function themeValueNames(themeCss: string): string[] {
  const names = [
    ...stripCssComments(themeCss).matchAll(
      /--(color|shadow|animate|font|radius|spacing)-([\w-]+)\s*:/g,
    ),
  ].map((m) => m[2]!);
  return [...new Set(names)];
}

// ---------------------------------------------------------------------------
// generation
// ---------------------------------------------------------------------------

type SourceFile = { name: string; file: string; content: string; kind: "ui" | "lib" | "css" };

function readSources(extra: Record<string, string> = {}): SourceFile[] {
  const files = readdirSync(SRC_DIR)
    .filter((f) => /\.(tsx?|css)$/.test(f))
    .filter((f) => !f.endsWith(".stories.tsx"))
    .filter((f) => f !== "index.ts"); // the npm barrel — meaningless once source is copied

  const entries: Array<[string, string]> = [
    ...files.map((f) => [f, readFileSync(join(SRC_DIR, f), "utf8")] as [string, string]),
    ...Object.entries(extra),
  ];

  return entries.map(([file, content]) => ({
    file,
    content,
    name: file.replace(/\.(tsx?|css)$/, ""),
    kind: file.endsWith(".css") ? "css" : file.endsWith(".tsx") ? "ui" : "lib",
  }));
}

/** Where an item's source lives once installed, expressed as a shadcn alias so
 *  the CLI can rewrite it to the consumer's own `components.json` paths. */
function aliasImport(source: SourceFile): string | null {
  if (source.kind === "ui") return `@/components/ui/${source.name}`;
  if (source.kind === "lib") return `@/lib/${source.name}`;
  return null;
}

export type BuildOptions = {
  baseUrl?: string;
  /** Extra `filename -> content` pairs treated as if they lived in `src/`.
   *  Used by the tests to prove the build gate actually fails. */
  extraSources?: Record<string, string>;
};

export function buildRegistry(options: BuildOptions = {}): {
  index: Registry;
  items: RegistryItem[];
} {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const sources = readSources(options.extraSources);
  const itemUrl = (name: string) => `${baseUrl}/r/${name}.json`;

  // One file in `src/` is one item, named after the file — so two files that
  // reduce to the same name (`effects.tsx` and `effects.css`) would fight over
  // one registry entry, and the loser's dependencies would vanish silently.
  const byName = new Map<string, SourceFile>();
  for (const source of sources) {
    const clash = byName.get(source.name);
    if (clash) {
      throw new Error(
        `Registry generation failed:\n  - "${source.file}" and "${clash.file}" both claim the item name "${source.name}"`,
      );
    }
    byName.set(source.name, source);
  }

  const sheets = sources.filter((s) => s.kind === "css");
  const sheetClasses = new Map(sheets.map((s) => [s.name, cssSubjectClasses(s.content)]));
  const themeSheet = byName.get("theme");
  const themeValues = themeSheet ? themeValueNames(themeSheet.content) : [];

  const problems: string[] = [];
  const items: RegistryItem[] = [];

  for (const source of sources) {
    const deps = new Set<string>();
    const registryDeps = new Set<string>();

    const files: RegistryItemFile[] = [];

    if (source.kind === "css") {
      files.push({
        path: `src/${source.file}`,
        content: source.content,
        type: "registry:file",
        target: `${CSS_TARGET_DIR}/${source.file}`,
      });

      // A sheet that reads `var(--x)` needs whichever sheet defines `--x`.
      const { defined, referenced } = cssCustomProperties(source.content);
      for (const ref of referenced) {
        if (defined.has(ref)) continue;
        const owner = sheets.find((s) => s !== source && sheetProperties(s).defined.has(ref));
        if (owner) registryDeps.add(owner.name);
        else problems.push(`${source.file}: \`var(${ref})\` is defined by no shipped stylesheet`);
      }
    } else {
      const aliases = new Map<string, string>();

      for (const spec of extractImports(source.content)) {
        if (spec.startsWith(".")) {
          // `src/` writes ESM-correct specifiers (`./utils.js` for `utils.ts`),
          // so strip the emitted extension as well as the authored one.
          const target = spec.replace(/^\.\//, "").replace(/\.(tsx?|jsx?|css)$/, "");
          const sibling = byName.get(target);
          if (!sibling) {
            problems.push(`${source.file}: relative import "${spec}" resolves to nothing shipped`);
            continue;
          }
          const alias = aliasImport(sibling);
          if (!alias) {
            problems.push(`${source.file}: "${spec}" points at a stylesheet, which cannot be imported from TS`);
            continue;
          }
          // Installed files land in the consumer's own tree, so siblings are
          // no longer siblings — hand the CLI an alias it can rewrite.
          aliases.set(spec, alias);
          registryDeps.add(sibling.name);
          continue;
        }

        const packageName = npmPackageName(spec);
        if (packageName in PEER_DEPENDENCIES) continue;
        const version = NPM_VERSIONS[packageName];
        if (!version) {
          problems.push(`${source.file}: "${spec}" is neither a peer nor a package.json dependency`);
          continue;
        }
        deps.add(`${packageName}@${version}`);
      }

      // Stylesheets the source needs to render as designed. Read the class
      // strings only — a `"dark"` variant prop or a `<span>dark</span>` is not
      // a use of the `.dark` rule tokens.css happens to define.
      const classStrings = extractClassStrings(source.content);
      for (const [sheet, classes] of sheetClasses) {
        if (classes.some((cls) => usesClass(classStrings, cls))) registryDeps.add(sheet);
      }
      if (themeSheet && themeValues.some((value) => usesClass(classStrings, value))) {
        registryDeps.add("theme");
      }

      // A component can also reach a token directly, through an arbitrary value
      // like `bg-[rgb(var(--gousse-panel))]`. The css branch enforces this for
      // sheets; without the same check here such a component ships with no
      // stylesheet at all and renders unstyled in the consumer's app.
      //
      // Scoped to `--gousse-*`: other custom properties are supplied at runtime
      // by whoever renders the component (Base UI sets `--transform-origin` on
      // its popups), and no shipped sheet can or should own them.
      for (const ref of new Set(
        [...classStrings.matchAll(/var\(\s*(--gousse-[\w-]+)/g)].map((m) => m[1]!),
      )) {
        const owner = sheets.find((s) => sheetProperties(s).defined.has(ref));
        if (owner) registryDeps.add(owner.name);
        else problems.push(`${source.file}: \`var(${ref})\` is defined by no shipped stylesheet`);
      }

      files.push({
        path: `src/${source.file}`,
        content: rewriteImports(source.content, (spec) => aliases.get(spec) ?? null),
        type: source.kind === "ui" ? "registry:ui" : "registry:lib",
      });
    }

    // A sheet must not depend on itself. Item names are unique (enforced
    // above), so a self-named dependency can only be this same source.
    registryDeps.delete(source.name);

    const description = describeModule(source.content);
    const item: RegistryItem = {
      $schema: REGISTRY_ITEM_SCHEMA_URL,
      name: source.name,
      type:
        source.kind === "css"
          ? "registry:file"
          : source.kind === "lib"
            ? "registry:lib"
            : "registry:ui",
      title: titleCase(source.name),
      description: description ?? `${titleCase(source.name)} — a gousse-ui primitive.`,
      author: AUTHOR,
      ...(deps.size ? { dependencies: [...deps].sort() } : {}),
      ...(registryDeps.size
        ? { registryDependencies: [...registryDeps].sort().map(itemUrl) }
        : {}),
      files,
      ...(source.kind === "css"
        ? {
            docs: `Add it to your entry stylesheet after \`@import "tailwindcss";\` — \`@import "./styles/gousse/${source.file}";\``,
          }
        : {}),
    };

    items.push(item);
  }

  items.sort((a, b) => a.name.localeCompare(b.name));

  problems.push(...verifyImportsResolvable(items));
  if (problems.length) {
    throw new Error(`Registry generation failed:\n  - ${problems.join("\n  - ")}`);
  }

  const index: Registry = {
    $schema: REGISTRY_SCHEMA_URL,
    name: REGISTRY_NAME,
    homepage: baseUrl,
    items: items.map((item) => ({
      ...item,
      $schema: undefined,
      files: item.files?.map(({ content: _content, ...rest }) => rest),
    })),
  };

  for (const item of items) registryItemSchema.parse(item);
  registrySchema.parse(index);

  return { index, items };
}

/**
 * The gate that matters: an installed item must not reference anything the
 * install did not bring along. Returns one message per unresolvable import.
 */
export function verifyImportsResolvable(items: RegistryItem[]): string[] {
  const problems: string[] = [];

  for (const item of items) {
    const bundled = new Set(
      (item.files ?? []).map((f) => f.path.replace(/^.*\//, "").replace(/\.(tsx?|css)$/, "")),
    );
    const registryDeps = new Set(
      (item.registryDependencies ?? [])
        .map((url) => url.match(/\/r\/([^/]+)\.json$/)?.[1])
        .filter((n): n is string => !!n),
    );
    const npmDeps = new Set((item.dependencies ?? []).map(npmPackageName));

    for (const file of item.files ?? []) {
      for (const spec of extractImports(file.content ?? "")) {
        const aliased = itemNameFromAliasImport(spec);
        if (aliased !== null) {
          if (!registryDeps.has(aliased) && !bundled.has(aliased)) {
            problems.push(`${item.name}: "${spec}" is neither a registry dependency nor bundled`);
          }
          continue;
        }
        if (spec.startsWith(".")) {
          problems.push(`${item.name}: relative import "${spec}" survived generation`);
          continue;
        }
        const packageName = npmPackageName(spec);
        if (!npmDeps.has(packageName) && !(packageName in PEER_DEPENDENCIES)) {
          problems.push(`${item.name}: "${spec}" is not a declared dependency or peer`);
        }
      }
    }
  }

  return problems;
}

// ---------------------------------------------------------------------------
// static output
// ---------------------------------------------------------------------------

function landingPage(index: Registry, baseUrl: string): string {
  const rows = index.items
    .map(
      (item) =>
        `      <tr><td><code>${item.name}</code></td><td>${item.type.replace("registry:", "")}</td>` +
        `<td>${(item.description ?? "").replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!)}</td>` +
        `<td><a href="r/${item.name}.json">json</a></td></tr>`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${REGISTRY_NAME} — shadcn registry</title>
    <style>
      body { font: 15px/1.6 ui-sans-serif, system-ui, sans-serif; max-width: 60rem; margin: 3rem auto; padding: 0 1.5rem; color: #11100e; background: #f9f7f4; }
      code, pre { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
      pre { background: #fff; border: 1px solid #e2ded7; border-radius: 8px; padding: 1rem; overflow-x: auto; }
      table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
      td, th { text-align: left; padding: .4rem .6rem; border-bottom: 1px solid #e2ded7; vertical-align: top; }
      a { color: #dc7828; }
    </style>
  </head>
  <body>
    <h1>${REGISTRY_NAME}</h1>
    <p>A shadcn registry of React 19 + Tailwind v4 primitives built on Base UI. Components are copied into your project — there is no package to install and no token to configure.</p>
    <pre>npx shadcn@latest add ${baseUrl}/r/button.json</pre>
    <p><a href="storybook/">Browse the components in Storybook</a> · <a href="registry.json">registry.json</a> · <a href="https://github.com/lucasriondel/gousse-ui">source</a></p>
    <table>
      <thead><tr><th>item</th><th>type</th><th>description</th><th></th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </body>
</html>
`;
}

function write(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

export function writeRegistry(outDir: string = OUT_DIR, baseUrl?: string): Registry {
  const resolvedBase = (baseUrl ?? process.env.REGISTRY_BASE_URL ?? DEFAULT_BASE_URL).replace(
    /\/+$/,
    "",
  );
  const { index, items } = buildRegistry({ baseUrl: resolvedBase });

  rmSync(outDir, { recursive: true, force: true });
  write(join(outDir, "registry.json"), `${JSON.stringify(index, null, 2)}\n`);
  for (const item of items) {
    write(join(outDir, "r", `${item.name}.json`), `${JSON.stringify(item, null, 2)}\n`);
  }
  write(join(outDir, "index.html"), landingPage(index, resolvedBase));
  write(join(outDir, ".nojekyll"), "");

  return index;
}

if (import.meta.main) {
  const index = writeRegistry();
  console.log(
    `registry: ${index.items.length} items -> ${OUT_DIR} (homepage ${index.homepage})`,
  );
}
