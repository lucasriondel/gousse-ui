/**
 * Packaging smoke check: `dist` must be loadable by Node's ESM resolver.
 *
 * The package is `"type": "module"`, so every relative specifier `tsc` emits
 * has to be a full path with an extension — Node does no extension guessing
 * and no directory-index lookup. Bundlers paper over extensionless specifiers,
 * so nothing else in this repo (Storybook, typecheck) catches a regression.
 *
 * This re-implements Node's *relative* ESM resolution rather than shelling out
 * to `node`, so the check holds even where `node` is a Bun shim (Bun resolves
 * extensionless imports happily and would pass a broken build).
 */
import { describe, expect, test, beforeAll } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const DIST = join(ROOT, "dist");

/** `from "…"` / `import("…")` / bare `import "…"` — enough for tsc's output. */
const SPECIFIER_RE = /(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function relativeSpecifiers(file: string): string[] {
  const source = readFileSync(file, "utf8");
  return [...source.matchAll(SPECIFIER_RE)]
    .map((m) => m[1]!)
    .filter((spec) => spec.startsWith("./") || spec.startsWith("../"));
}

beforeAll(() => {
  const built = Bun.spawnSync(["bun", "run", "build"], { cwd: ROOT });
  if (built.exitCode !== 0) {
    throw new Error(`bun run build failed:\n${built.stderr.toString()}`);
  }
});

describe("dist ESM resolution", () => {
  test("build emits the barrel and the css sheets", () => {
    for (const file of [
      "index.js",
      "index.d.ts",
      "utils.js",
      "tokens.css",
      "theme.css",
      "effects.css",
    ]) {
      expect(existsSync(join(DIST, file))).toBe(true);
    }
  });

  test("every relative specifier in dist resolves the way Node would", () => {
    const emitted = walk(DIST).filter(
      (f) => f.endsWith(".js") || f.endsWith(".d.ts"),
    );
    expect(emitted.length).toBeGreaterThan(0);

    const unresolvable: string[] = [];
    for (const file of emitted) {
      for (const spec of relativeSpecifiers(file)) {
        // Node ESM: resolve verbatim against the importer, no extension
        // search, no `index.js` fallback. A `.d.ts` importing "./utils.js"
        // is fine — TS finds `utils.d.ts` from the same specifier.
        if (!existsSync(resolve(dirname(file), spec))) {
          unresolvable.push(`${file.slice(ROOT.length + 1)} -> ${spec}`);
        }
      }
    }

    expect(unresolvable).toEqual([]);
  });

  test("the built barrel loads and re-exports every primitive", async () => {
    const barrel = await import(join(DIST, "index.js"));
    for (const name of ["cn", "Button", "Input", "DropdownMenu", "Sidebar"]) {
      expect(barrel[name]).toBeDefined();
    }
  });
});
