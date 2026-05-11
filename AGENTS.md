<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FSD layer rules

Frontend code is organized by Feature-Sliced Design layers. Each layer can only import from layers below it:

```
app  ▶  widgets  ▶  features  ▶  entities  ▶  shared
```

`process` is an extra type (not a real FSD layer) for server-only glue: `src/lib/**`, `src/app/actions/**`, `src/app/api/**`, `src/proxy.ts`. Anything layered can call into `process`; `process` can call into anything.

Within a layer, slices may NOT import each other directly (e.g. `features/todo-create` cannot import from `features/todo-edit`). If you need cross-slice composition, do it from a layer above via render props / injection — see `entities/todo/ui/TodoRow.tsx`'s `renderEditor` for the pattern.

Every slice exposes only its Public API at `<slice>/index.ts`. Import via the slice root:

```ts
import { Sidebar } from "@/widgets/sidebar";          // ✅
import { Sidebar } from "@/widgets/sidebar/ui/Sidebar"; // ❌ (internal path)
```

The boundaries plugin in `eslint.config.mjs` enforces these rules — `npm run lint` flags violations. Don't loosen them without an explicit reason.
