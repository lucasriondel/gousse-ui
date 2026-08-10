import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

import {
  buildRegistry,
  describeModule,
  extractImports,
  itemNameFromAliasImport,
  npmPackageName,
  PEER_DEPENDENCIES,
  SRC_DIR,
} from "./build-registry.js";
import { registryItemSchema, registrySchema } from "./registry-schema.js";

const BASE_URL = "https://example.test/gousse";
const { index, items } = buildRegistry({ baseUrl: BASE_URL });

const byName = new Map(items.map((item) => [item.name, item]));

/** The registry is generated from `src/` — this is what the generator must cover. */
function sourceModuleNames(): string[] {
  return readdirSync(SRC_DIR)
    .filter((f) => /\.(tsx?|css)$/.test(f))
    .filter((f) => !f.endsWith(".stories.tsx"))
    .filter((f) => f !== "index.ts") // the npm barrel; meaningless once source is copied
    .map((f) => f.replace(/\.(tsx?|css)$/, ""));
}

/** `https://example.test/gousse/r/utils.json` -> `utils` */
function itemNameFromUrl(url: string): string | null {
  const m = url.match(/\/r\/([^/]+)\.json$/);
  return m ? m[1]! : null;
}

describe("registry index", () => {
  test("every module in src/ appears in the index", () => {
    const indexed = new Set(index.items.map((i) => i.name));
    for (const name of sourceModuleNames()) {
      expect(indexed).toContain(name);
    }
  });

  test("the index carries no source content (it is a browse manifest)", () => {
    for (const item of index.items) {
      for (const file of item.files ?? []) {
        expect(file.content).toBeUndefined();
      }
    }
  });

  test("the index validates against the shadcn registry schema", () => {
    expect(() => registrySchema.parse(index)).not.toThrow();
  });

  test("every item is reachable at the documented url", () => {
    for (const item of items) {
      expect(`${BASE_URL}/r/${item.name}.json`).toMatch(/^https:\/\/\S+\.json$/);
    }
  });
});

describe("registry items", () => {
  test("every item validates against the shadcn registry-item schema", () => {
    for (const item of items) {
      expect(() => registryItemSchema.parse(item)).not.toThrow();
    }
  });

  test("every item ships at least one file with content", () => {
    for (const item of items) {
      expect(item.files?.length ?? 0).toBeGreaterThan(0);
      for (const file of item.files ?? []) {
        expect(file.content?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });

  test("every registryDependency points at an item this registry serves", () => {
    for (const item of items) {
      for (const url of item.registryDependencies ?? []) {
        const dep = itemNameFromUrl(url);
        expect(url.startsWith(`${BASE_URL}/`)).toBe(true);
        expect(dep).not.toBeNull();
        expect(byName.has(dep!)).toBe(true);
      }
    }
  });

  test("no item depends on itself", () => {
    for (const item of items) {
      const deps = (item.registryDependencies ?? []).map(itemNameFromUrl);
      expect(deps).not.toContain(item.name);
    }
  });
});

describe("import resolvability", () => {
  // The property that matters: a consumer who installs an item must not end up
  // with source that references something the install did not bring along.
  test("every import in every shipped file is accounted for", () => {
    for (const item of items) {
      const bundled = new Set(
        (item.files ?? []).map((f) => f.path.replace(/^.*\//, "").replace(/\.(tsx?|css)$/, "")),
      );
      const registryDeps = new Set(
        (item.registryDependencies ?? []).map(itemNameFromUrl).filter(Boolean) as string[],
      );
      const npmDeps = new Set((item.dependencies ?? []).map(npmPackageName));

      for (const file of item.files ?? []) {
        for (const spec of extractImports(file.content ?? "")) {
          const aliased = itemNameFromAliasImport(spec);
          if (aliased !== null) {
            expect(
              registryDeps.has(aliased) || bundled.has(aliased),
              `${item.name}: "${spec}" in ${file.path} is neither a registry dependency nor bundled`,
            ).toBe(true);
            continue;
          }

          expect(
            spec.startsWith("."),
            `${item.name}: "${spec}" in ${file.path} is a relative import that survived generation`,
          ).toBe(false);

          const pkg = npmPackageName(spec);
          expect(
            npmDeps.has(pkg) || pkg in PEER_DEPENDENCIES,
            `${item.name}: "${spec}" in ${file.path} is not a declared dependency or peer`,
          ).toBe(true);
        }
      }
    }
  });

  test("declared npm dependencies are version-pinned", () => {
    for (const item of items) {
      for (const dep of item.dependencies ?? []) {
        expect(dep, `${item.name}: "${dep}" has no version range`).toMatch(/.@[\^~]?\d/);
      }
    }
  });

  test("the base-ui release candidate is surfaced, not hidden", () => {
    const baseUi = items
      .flatMap((i) => i.dependencies ?? [])
      .filter((d) => d.startsWith("@base-ui-components/react@"));
    expect(baseUi.length).toBeGreaterThan(0);
    for (const dep of baseUi) expect(dep).toContain("-rc.");
  });
});

describe("shared modules", () => {
  test("utils and field-chrome are their own items, not duplicated copies", () => {
    for (const name of ["utils", "field-chrome"]) {
      const item = byName.get(name);
      expect(item, `${name} should be its own registry item`).toBeDefined();
      expect(item!.type).toBe("registry:lib");
      expect(item!.files).toHaveLength(1);
    }
  });

  test("the ESM `.js` extension src/ writes is stripped when aliasing", () => {
    // src/ imports siblings as `./utils.js` so the emitted dist is valid Node
    // ESM; the registry must still recognise that as the `utils` item.
    const { items: generated } = buildRegistry({
      baseUrl: BASE_URL,
      extraSources: { "esm-consumer.tsx": `import { cn } from "./utils.js";\nexport const C = cn;\n` },
    });
    const item = generated.find((i) => i.name === "esm-consumer")!;
    expect(item.files![0]!.content).toContain(`"@/lib/utils"`);
    expect((item.registryDependencies ?? []).map(itemNameFromUrl)).toContain("utils");
  });

  test("every item whose source imports a shared module declares it", () => {
    for (const item of items) {
      const deps = new Set(
        (item.registryDependencies ?? []).map(itemNameFromUrl).filter(Boolean) as string[],
      );
      for (const file of item.files ?? []) {
        for (const spec of extractImports(file.content ?? "")) {
          const shared = itemNameFromAliasImport(spec);
          if (shared === "utils" || shared === "field-chrome") {
            expect(deps, `${item.name} imports ${shared} without declaring it`).toContain(shared);
          }
        }
      }
    }
  });
});

describe("stylesheets", () => {
  test("the three sheets are installable items", () => {
    for (const name of ["tokens", "theme", "effects"]) {
      const item = byName.get(name);
      expect(item, `${name}.css should be a registry item`).toBeDefined();
      expect(item!.type).toBe("registry:file");
      expect(item!.files![0]!.target).toMatch(/\.css$/);
    }
  });

  test("theme pulls in tokens — the vars it maps must exist first", () => {
    const deps = (byName.get("theme")!.registryDependencies ?? []).map(itemNameFromUrl);
    expect(deps).toContain("tokens");
  });

  test("items styled with gousse theme utilities declare the theme sheet", () => {
    // `bg-gousse-ink`, `shadow-gousse-xl`, `animate-fade-in` … resolve only when
    // theme.css (and through it tokens.css) is installed.
    for (const name of ["button", "badge", "sidebar", "dropdown-menu", "empty"]) {
      const deps = (byName.get(name)!.registryDependencies ?? []).map(itemNameFromUrl);
      expect(deps, `${name} uses theme utilities`).toContain("theme");
    }
  });

  test("items styled with effects classes declare the effects sheet", () => {
    for (const name of ["rainbow-glow", "sheen"]) {
      const deps = (byName.get(name)!.registryDependencies ?? []).map(itemNameFromUrl);
      expect(deps, `${name} uses effects.css classes`).toContain("effects");
    }
  });

  test("items that use no effects class do not drag effects along", () => {
    for (const name of ["button", "input", "spinner"]) {
      const deps = (byName.get(name)!.registryDependencies ?? []).map(itemNameFromUrl);
      expect(deps, `${name} uses no effects class`).not.toContain("effects");
    }
  });

  test("a sheet's ancestor selectors are not mistaken for classes it owns", () => {
    // effects.css styles `.group:hover .gousse-sheen` — `.group` is a hook the
    // consumer provides, not something installing effects.css gives you. A
    // component using Tailwind's `group` must not be dragged onto the sheet.
    for (const name of ["sidebar", "radio-group"]) {
      const deps = (byName.get(name)!.registryDependencies ?? []).map(itemNameFromUrl);
      expect(deps, `${name} only uses \`group\`, not a gousse effect`).not.toContain("effects");
    }
  });
});

describe("descriptions", () => {
  test("describe the exported symbol, not an internal prop doc", () => {
    const source = [
      `interface Props {`,
      `  /** Initials length — 2 for the trigger, 1 for compact list rows. */`,
      `  chars?: 1 | 2;`,
      `}`,
      ``,
      `/**`,
      ` * Circular account avatar — image when available, initials otherwise.`,
      ` * Sizing comes from \`className\`.`,
      ` */`,
      `export const Avatar = () => null;`,
    ].join("\n");

    expect(describeModule(source)).toBe(
      "Circular account avatar — image when available, initials otherwise.",
    );
  });

  test("describe the module, not a later exported helper", () => {
    const source = [
      `/** The shared pill chassis for gousse's badges. Folds four bricks into one. */`,
      `const badge = cva("inline-flex");`,
      ``,
      `/** Rendered as a <span>. */`,
      `export function Badge() { return null; }`,
    ].join("\n");

    expect(describeModule(source)).toBe("The shared pill chassis for gousse's badges.");
  });

  test("fall back to an indented doc when the file has no module-level one", () => {
    expect(describeModule(`interface P {\n  /** Only doc here. */\n  x?: 1;\n}`)).toBe(
      "Only doc here.",
    );
  });

  test("work on plain css comments too", () => {
    expect(describeModule(`/* Design-system token contract. Values ported. */\n:root {}`)).toBe(
      "Design-system token contract.",
    );
  });

  test("are undefined when the source carries no doc comment", () => {
    expect(describeModule(`export const X = 1;`)).toBeUndefined();
  });

  test("read as prose — no jsdoc markup leaks into the registry", () => {
    expect(describeModule(`/** Shares {@link Input}'s chrome. */\nexport const X = 1;`)).toBe(
      "Shares Input's chrome.",
    );
    for (const item of items) {
      expect(item.description, `${item.name}`).not.toContain("{@link");
    }
  });

  test("every item is described", () => {
    for (const item of items) {
      expect(item.description?.length ?? 0).toBeGreaterThan(0);
      expect(item.title?.length ?? 0).toBeGreaterThan(0);
    }
  });
});

describe("generation is drift-proof", () => {
  test("adding a component needs no manifest edit — items derive from filenames", () => {
    for (const item of items) {
      const paths = (item.files ?? []).map((f) => f.path);
      expect(paths.some((p) => p.includes(`/${item.name}.`))).toBe(true);
    }
  });

  test("stories and the npm barrel are not part of the payload", () => {
    const paths = items.flatMap((i) => (i.files ?? []).map((f) => f.path));
    expect(paths.some((p) => p.endsWith(".stories.tsx"))).toBe(false);
    expect(paths.some((p) => p.endsWith("/index.ts"))).toBe(false);
  });
});

describe("extractImports", () => {
  test("catches every import form and ignores comments", () => {
    const source = [
      `/** Requires \`import "@lucasriondel/gousse-ui/effects.css"\` — a comment. */`,
      `// from "not-an-import"`,
      `import type { ComponentProps } from "react";`,
      `import { Menu } from "@base-ui-components/react/menu";`,
      `import "./side-effect.css";`,
      `export { cn } from "./utils";`,
      `const lazy = await import("@/lib/dynamic");`,
      `const url = "https://example.com";`,
    ].join("\n");

    expect(new Set(extractImports(source))).toEqual(
      new Set([
        "react",
        "@base-ui-components/react/menu",
        "./side-effect.css",
        "./utils",
        "@/lib/dynamic",
      ]),
    );
  });
});

describe("npmPackageName", () => {
  test("resolves subpath imports back to their package", () => {
    expect(npmPackageName("@base-ui-components/react/menu")).toBe("@base-ui-components/react");
    expect(npmPackageName("lucide-react")).toBe("lucide-react");
    expect(npmPackageName("react-dom/client")).toBe("react-dom");
    expect(npmPackageName("class-variance-authority@^0.7.1")).toBe("class-variance-authority");
    expect(npmPackageName("@base-ui-components/react@1.0.0-rc.0")).toBe(
      "@base-ui-components/react",
    );
  });
});

describe("build gate", () => {
  test("generation fails loudly rather than emitting a broken entry", () => {
    // The generator validates on the way out; a src/ file importing something it
    // can't classify must throw, not silently ship.
    expect(() =>
      buildRegistry({ baseUrl: BASE_URL, extraSources: { "broken.tsx": `import { x } from "totally-not-installed";\nexport const X = x;\n` } }),
    ).toThrow(/totally-not-installed/);
  });

  test("generation fails when a src file imports a sibling that is not published", () => {
    expect(() =>
      buildRegistry({
        baseUrl: BASE_URL,
        extraSources: { "broken.tsx": `import { y } from "./nowhere";\nexport const Y = y;\n` },
      }),
    ).toThrow(/nowhere/);
  });
});

describe("source layout", () => {
  test("the generator reads the real component directory", () => {
    expect(SRC_DIR).toBe(join(import.meta.dir, "..", "src"));
  });
});
