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
} from "./registry-schema";

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

/** Drop comments so a `from "…"` inside prose is not mistaken for an import. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

/** Every module specifier a file pulls in: static, side-effect, and dynamic. */
export function extractImports(source: string): string[] {
  const code = stripComments(source);
  const specs: string[] = [];
  const patterns = [
    /\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']/g,
  ];
  for (const re of patterns) {
    for (const m of code.matchAll(re)) specs.push(m[1]!);
  }
  return [...new Set(specs)];
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

/** Match a Tailwind theme value / CSS class inside a class string, where the
 *  left neighbour is usually a utility prefix (`bg-`, `shadow-`). */
function usesToken(source: string, token: string): boolean {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_-])`).test(source);
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
  const byName = new Map(sources.map((s) => [s.name, s]));
  const itemUrl = (name: string) => `${baseUrl}/r/${name}.json`;

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
        const owner = sheets.find((s) => s.name !== source.name && cssCustomProperties(s.content).defined.has(ref));
        if (owner) registryDeps.add(owner.name);
        else problems.push(`${source.file}: \`var(${ref})\` is defined by no shipped stylesheet`);
      }
    } else {
      let content = source.content;

      for (const spec of extractImports(source.content)) {
        if (spec.startsWith(".")) {
          const target = spec.replace(/^\.\//, "").replace(/\.(tsx?|css)$/, "");
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
          content = content.replaceAll(`"${spec}"`, `"${alias}"`).replaceAll(`'${spec}'`, `'${alias}'`);
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
      // strings, not the prose — doc comments mention plenty they don't use.
      const classStrings = stripComments(source.content);
      for (const [sheet, classes] of sheetClasses) {
        if (classes.some((cls) => usesToken(classStrings, cls))) registryDeps.add(sheet);
      }
      if (themeSheet && themeValues.some((value) => usesToken(classStrings, value))) {
        registryDeps.add("theme");
      }

      files.push({
        path: `src/${source.file}`,
        content,
        type: source.kind === "ui" ? "registry:ui" : "registry:lib",
      });
    }

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
