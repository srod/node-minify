# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

**Generated:** 2026-01-28 | **Commit:** 9b0b0f5f | **Branch:** develop

## Requirements
- **Node.js**: >=20.0.0
- **Bun**: 1.3.5+ (package manager & runtime)

## Commands
| Task | Command |
|------|---------|
| Install | `bun install` |
| Build all | `bun run build` |
| Build deps first | `bun run build:deps` (utils + run) |
| Lint | `bun run lint` |
| Format | `bun run format` |
| Typecheck | `bun run typecheck` |
| Test all | `bun run test` |
| Test package | `bun run test packages/<name>` |
| Test file | `bun run test packages/core/__tests__/core.test.ts` |
| CI (full) | `bun run ci` |
| Add changeset | `bun run changeset` |

## Code Style (Biome)
- **Indent**: 4 spaces | **Quotes**: double | **Semicolons**: always | **Trailing commas**: ES5
- **Imports**: `type` keyword for type-only; `node:` prefix for Node.js built-ins
- **Extensions**: Include `.ts` in local imports (e.g., `./setup.ts`)
- **Naming**: camelCase functions/variables, PascalCase types/interfaces
- **Headers**: All source files: `/*! node-minify ... MIT Licensed */`
- **JSDoc**: All exported functions MUST have `@param` and `@returns` tags

## Architecture

Bun monorepo for compressing JS, CSS, HTML, JSON, and images.

### Package Map

```
packages/
├── core/           # Main minify() function
├── utils/          # Shared utilities (see packages/utils/AGENTS.md)
├── types/          # TypeScript definitions (no build, exports src/types.d.ts)
├── run/            # Java process wrapper (YUI, GCC)
├── cli/            # Commander.js CLI
├── benchmark/      # Compressor comparison tool
├── action/         # GitHub Action (see packages/action/AGENTS.md)
└── <compressor>/   # 22 compressor wrappers (terser, esbuild, lightningcss, etc.)
```

### Compressors by Type

| Type | Recommended | Alternatives |
|------|-------------|--------------|
| **JS** | `terser` | `esbuild`, `swc`, `oxc`, `uglify-js`, `google-closure-compiler` |
| **CSS** | `lightningcss` | `esbuild`, `clean-css`, `cssnano`, `csso` |
| **HTML** | `html-minifier` | `minify-html` |
| **JSON** | `jsonminify` | - |
| **Images** | `sharp` (WebP/AVIF), `svgo` (SVG), `imagemin` (PNG/JPEG/GIF) | - |

**Deprecated** (emit warnings): `babel-minify`, `uglify-es`, `yui`, `crass`, `sqwish`

### Dependencies
```
core → utils + types
cli → core + benchmark + utils
action → core + benchmark + utils
benchmark → core + utils
compressors → utils + types
```

**Build order**: `utils` + `run` first → all others parallel

### Package Pattern
```
packages/<name>/
├── src/index.ts      # Main export
├── __tests__/        # Vitest tests
├── package.json      # exports: { types, default }
├── tsconfig.json
└── vitest.config.ts
```

**Exceptions**:
- `types`: No build, exports `src/types.d.ts` directly
- `action`: Uses `bun build` (bundled), has `action.yml`
- `cli`: Dual entry (`src/index.ts` + `src/bin/cli.ts`)
- `utils`: Multi-file build (`tsdown src/*.ts`)

## Key Types

From `@node-minify/types`:
```ts
Settings          // User options for minify()
MinifierOptions   // What compressors receive: { settings, content }
CompressorResult  // What compressors return: { code, map?, buffer?, outputs? }
Compressor        // Function: (args: MinifierOptions) => Promise<CompressorResult>
```

## Adding a New Compressor

1. Create `packages/<name>/` with standard structure
2. Export async function matching `Compressor` type:
```ts
import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent, wrapMinificationError } from "@node-minify/utils";

export async function myCompressor({ settings, content }: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "my-compressor");
    try {
        // ... minification logic
        return { code: minifiedCode };
    } catch (error) {
        throw wrapMinificationError("my-compressor", error);
    }
}
```
3. Add tests using `runOneTest` from `tests/fixtures.ts`
4. Add changeset: `bun run changeset`

## Testing

**Shared fixtures** (`tests/fixtures.ts`):
- `runOneTest({ options, compressorLabel, compressor })` — Run single test
- `tests` object — Pre-defined suites: `concat`, `commonjs`, `commoncss`, `commonhtml`, `commonjson`

**File paths** (`tests/files-path.ts`):
- `filesJS`, `filesCSS`, `filesHTML`, `filesJSON`, `filesImages`

**Convention**: Tests auto-isolate to `tests/tmp/` when using `replaceInPlace` or `$1` output patterns.

**Timeouts**: Core/YUI packages use 60s timeout for slow Java compressors.

## Changesets

Required for user-facing changes:
```bash
bun run changeset           # Add changeset (interactive)
bun run changeset:version   # Bump versions
```

Custom `scripts/publish.ts` resolves `workspace:*` → concrete versions before npm publish.

## Anti-Patterns (DO NOT)

- **Never** suppress types: `as any`, `@ts-ignore`, `@ts-expect-error`
- **Never** remove JSDoc from exported functions
- **Never** use deprecated packages in new code
- **Never** commit without `bun run lint`
- **Never** use sync file operations in compressor code (use async)
- **Never** mix image and text files in same input array

## GitHub Action

Published as `srod/node-minify@v1`. See `packages/action/AGENTS.md` for details.

```yaml
- uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"
```

Zero-config mode:
```yaml
- uses: srod/node-minify@v1
  with:
    auto: true
    output-dir: dist
```

## CI/CD

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `test.yml` | Push/PR | Build, lint, typecheck, test |
| `publish.yml` | Push to main | Changesets release + npm publish |
| `test-action.yml` | Action changes | GitHub Action integration tests |
| `release-action.yml` | Release | Bundle action dist, update tags |

## Documentation Site

`docs/` is a separate Astro site. See `docs/AGENTS.md`.

```bash
cd docs && bun run dev    # Dev server at localhost:4321
cd docs && bun run build  # Production build
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails | `bun run build:deps` first |
| Type errors | Run `bun run build` (types from `dist/`) |
| Test isolation | Uses `tests/tmp/` (gitignored) |
| Clean rebuild | `bun run clean && bun run build` |
| Java compressors | Ensure Java installed for `yui`/`gcc` |
