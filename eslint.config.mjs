import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

// FSD layer hierarchy. Each layer can only import from layers below it:
//   app  ▶  widgets  ▶  features  ▶  entities  ▶  shared
//
// "process" is a hatch for files that don't belong to a layer — server-only
// code (src/lib, server actions inside src/app, proxy.ts). They can reach
// into any layer, and layered code can reach into them.

const LAYERS = ["app", "widgets", "features", "entities", "shared", "process"];
// boundaries v6 takes selector objects: allow: [{ to: { type: "shared" } }, ...]
const to = (types) => types.map((type) => ({ to: { type } }));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        { type: "widgets", pattern: "src/widgets/*", mode: "folder" },
        { type: "features", pattern: "src/features/*", mode: "folder" },
        { type: "entities", pattern: "src/entities/*", mode: "folder" },
        { type: "shared", pattern: "src/shared/**/*" },
        // Server-only glue: not part of FSD layers.
        { type: "process", pattern: "src/lib/**/*" },
        { type: "process", pattern: "src/proxy.ts" },
        { type: "process", pattern: "src/app/actions/**/*" },
        { type: "process", pattern: "src/app/api/**/*" },
        // FSD "app" layer — pages, root layout, providers.
        { type: "app", pattern: "src/app/(app)/**/*" },
        { type: "app", pattern: "src/app/signin/**/*" },
        { type: "app", pattern: "src/app/providers/**/*" },
        { type: "app", pattern: "src/app/layout.tsx" },
        { type: "app", pattern: "src/app/page.tsx" },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          rules: [
            { from: { type: "app" }, allow: to(LAYERS) },
            { from: { type: "widgets" }, allow: to(["features", "entities", "shared", "process"]) },
            { from: { type: "features" }, allow: to(["entities", "shared", "process"]) },
            { from: { type: "entities" }, allow: to(["shared", "process"]) },
            { from: { type: "shared" }, allow: to(["shared", "process"]) },
            { from: { type: "process" }, allow: to(LAYERS) },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
