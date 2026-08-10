import { z } from "zod";

/**
 * Zod mirror of the shadcn registry JSON Schemas, kept narrow enough to be a
 * real gate rather than a rubber stamp:
 *   <https://ui.shadcn.com/schema/registry.json>
 *   <https://ui.shadcn.com/schema/registry-item.json>
 *
 * The build validates every generated document against this before writing, so
 * a malformed entry fails here instead of at a consumer's `shadcn add`.
 */

export const REGISTRY_SCHEMA_URL = "https://ui.shadcn.com/schema/registry.json";
export const REGISTRY_ITEM_SCHEMA_URL = "https://ui.shadcn.com/schema/registry-item.json";

const ITEM_TYPES = [
  "registry:lib",
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:theme",
  "registry:page",
  "registry:file",
  "registry:style",
  "registry:base",
  "registry:font",
  "registry:item",
] as const;

/** `registry:font` is item-only — a file can never carry it. Spelled out rather
 *  than filtered so the literal union survives: routing through `unknown` would
 *  widen `RegistryItemFile["type"]` to `string` and stop the compiler catching a
 *  mistyped `type:` at every `files.push` in the generator. */
const FILE_TYPES = ITEM_TYPES.filter(
  (t): t is Exclude<(typeof ITEM_TYPES)[number], "registry:font"> => t !== "registry:font",
) as [
  Exclude<(typeof ITEM_TYPES)[number], "registry:font">,
  ...Exclude<(typeof ITEM_TYPES)[number], "registry:font">[],
];

export const registryItemTypeSchema = z.enum(ITEM_TYPES);

/** `registry:file` and `registry:page` have no derivable destination, so the
 *  upstream schema requires an explicit `target` for them. */
export const registryItemFileSchema = z
  .object({
    path: z.string().min(1),
    content: z.string().optional(),
    type: z.enum(FILE_TYPES),
    target: z.string().optional(),
  })
  .refine((f) => !["registry:file", "registry:page"].includes(f.type) || !!f.target, {
    message: "registry:file and registry:page entries require an explicit `target`",
    path: ["target"],
  });

const cssValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.record(z.string(), cssValueSchema)]),
);

export const registryItemSchema = z.object({
  $schema: z.string().optional(),
  name: z.string().min(1),
  type: registryItemTypeSchema,
  title: z.string().optional(),
  description: z.string().optional(),
  author: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  cssVars: z
    .object({
      theme: z.record(z.string(), z.string()).optional(),
      light: z.record(z.string(), z.string()).optional(),
      dark: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  css: z.record(z.string(), cssValueSchema).optional(),
  envVars: z.record(z.string(), z.string()).optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
  docs: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export const registrySchema = z.object({
  $schema: z.string().optional(),
  name: z.string().min(1),
  homepage: z.string().min(1),
  items: z.array(registryItemSchema),
});

export type RegistryItemFile = z.infer<typeof registryItemFileSchema>;
export type RegistryItem = z.infer<typeof registryItemSchema>;
export type Registry = z.infer<typeof registrySchema>;
