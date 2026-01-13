# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

**Generated:** 2026-01-09 | **Commit:** 7d82916d | **Branch:** develop

## Requirements
- **Node.js**: >=20.0.0
- **Bun**: 1.3.5+

## Package Manager

This branch (`develop`) uses **Bun** as the package manager and runtime.

## Commands
- **Install**: `bun install`
- **Build**: `bun run build`
- **Lint**: `bun run lint` | **Format**: `bun run format`
- **Test all**: `bun run test`
- **Test single package**: `bun run test packages/<name>` (e.g., `bun run test packages/core`)
- **Test single file**: `bun run test packages/core/__tests__/core.test.ts`
- **Typecheck**: `bun run typecheck`
- **CI (full)**: `bun run ci`

## Code Style (Biome)
- **Indent**: 4 spaces | **Quotes**: double | **Semicolons**: always | **Trailing commas**: ES5
- **Imports**: Use `type` keyword for type-only imports. Use `node:` prefix for Node.js built-ins (e.g., `node:child_process`)
- **File extensions**: Include `.ts` in local imports (e.g., `./setup.ts`)
- **Naming**: camelCase for functions/variables, PascalCase for types/interfaces
- **Tests**: Vitest with `describe`/`test`/`expect`. Files in `packages/*/__tests__/*.test.ts`
- **Error handling**: Use `try/catch` with `if (err instanceof Error)` checks
- **Source files**: Include copyright header: `/*! node-minify ... MIT Licensed */`

### Linter Rules (from biome.json)
- `noForEach`: off (forEach allowed)
- `noParameterAssign`: off (parameter reassignment allowed)
- `noExplicitAny`: off (but prefer proper types when possible)
- `noConfusingVoidType`: off
- `noAssignInExpressions`: off
- Organize imports automatically on save

## Architecture

This is a Bun monorepo for compressing JavaScript, CSS, HTML, and image files using various backends.

### Package Structure

**Core packages** (in `/packages`):
- `core` - Main `minify()` function, orchestrates compression
- `utils` - Shared utilities (file operations, gzip sizing, compressor resolution)
- `run` - Command execution wrapper for Java-based external tools (YUI, GCC)
- `types` - TypeScript type definitions (not compiled, exports directly from `src/types.d.ts`)
- `cli` - Command-line interface using Commander.js
- `benchmark` - Benchmark tool to compare compressor performance

**Compressor packages** - Each wraps a specific minification library:
- JS: `esbuild`, `google-closure-compiler`, `oxc`, `swc`, `terser`, `uglify-js`
- CSS: `clean-css`, `cssnano`, `csso`, `esbuild`, `lightningcss`
- HTML: `html-minifier`, `minify-html`
- Image: `sharp` (WebP/AVIF), `svgo` (SVG), `imagemin` (PNG/JPEG/GIF)
- Other: `jsonminify`, `no-compress` (passthrough)

**Deprecated** (emit warnings, use alternatives):
- `babel-minify` - Babel 6 only → use `terser`
- `uglify-es` - Unmaintained → use `terser`
- `yui` - Java-based, deprecated 2013 → use modern alternatives
- `crass` - Unmaintained → use `lightningcss` or `clean-css`
- `sqwish` - Unmaintained → use `lightningcss` or `clean-css`

### Dependencies

`core` → `utils` + `types`. All compressor packages → `core`. Build order: `utils` and `run` first, then parallel build of all others.

### Package Pattern

All packages follow the same structure:
```text
packages/<name>/
├── src/index.ts      # Main export
├── __tests__/        # Vitest tests
├── package.json
└── tsconfig.json
```

**Exception**: `@node-minify/types` has no build process. Main points directly to `src/types.d.ts`.

Build: `tsdown` (configured via `tsdown.config.ts`)

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning.
- **Add changeset**: `bun run changeset` (interactive prompt)
- **Version packages**: `bun run changeset:version`
- Required for any user-facing changes (features, fixes, breaking changes)

**Note**: Uses custom `scripts/publish.ts` to resolve `workspace:*` dependencies before npm publish.

## Adding a New Compressor

1. Create `packages/<name>/` with standard structure
2. Export async function matching `Compressor` type from `@node-minify/types`
3. Function receives `{ settings, content }`, returns `{ code, map? }`
4. Use `ensureStringContent(content, "compressor-name")` for input validation
5. Add tests using shared helpers from `tests/fixtures.ts`

Example compressor signature:
```ts
import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import { ensureStringContent } from "@node-minify/utils";

export async function myCompressor({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const contentStr = ensureStringContent(content, "my-compressor");
    // ... minification logic
    return { code: minifiedCode, map: sourceMap };
}
```

### Compressor-Specific Patterns

| Compressor | Special Handling |
|------------|------------------|
| `esbuild` | Requires `settings.type` ("js" or "css"), extracts `sourceMap` from options |
| `lightningcss` | Uses Buffer-based API: `Buffer.from()` input, `.toString()` output |
| `clean-css` | Complex sourceMap processing, synchronous API |
| `yui`/`gcc` | Uses `@node-minify/run` for Java process spawning |

## Testing

Tests use shared fixtures from `tests/fixtures.ts`:
- `runOneTest({ options, compressorLabel, compressor })` - Run a single test case
- `tests` object contains test suites: `concat`, `commonjs`, `commoncss`, `commonhtml`, `commonjson`, `babelMinify`, `uglifyjs`
- Tests auto-isolate `publicFolder` to `tests/tmp/` to prevent fixture overwrites

Types are in `packages/types/src/types.d.ts` (not `index.ts`).

## Key Types

From `@node-minify/types`:
- `Settings` - User-facing options for `minify()` function
- `MinifierOptions` - What compressors receive (`{ settings, content }`)
- `CompressorResult` - What compressors return (`{ code, map?, buffer?, outputs? }`)
- `Compressor` - Function type: `(args: MinifierOptions) => Promise<CompressorResult>`

## Common Patterns

### File Operations (from @node-minify/utils)
```ts
import { readFile, writeFile, getFilesizeInBytes } from "@node-minify/utils";

const content = await readFile("src/app.js");
await writeFile({ file: "dist/app.min.js", content, index: 0 });
const size = await getFilesizeInBytes("dist/app.min.js");
```

### Deprecation Warnings
```ts
import { warnDeprecation } from "@node-minify/utils";

warnDeprecation("@node-minify/old-package", "Use @node-minify/new-package instead");
// Displays once per package per process
```

### Dynamic Compressor Resolution
```ts
import { resolveCompressor, isBuiltInCompressor } from "@node-minify/utils";

// Resolve a compressor by name (built-in, npm package, or local file)
const { compressor, label, isBuiltIn } = await resolveCompressor("terser");
const { compressor: custom } = await resolveCompressor("./my-compressor.js");
const { compressor: pkg } = await resolveCompressor("my-custom-package");

// Check if a name is a built-in compressor
if (isBuiltInCompressor("terser")) {
    // ...
}
```

### Async / Parallel Patterns

The codebase uses async functions for file operations and parallel compression.

#### Async File Operations
```ts
import {
    getContentFromFilesAsync,
    isValidFileAsync,
} from "@node-minify/utils";

// Async file reading (preferred for non-blocking IO)
const content = await getContentFromFilesAsync("src/app.js");
const contents = await getContentFromFilesAsync(["src/a.js", "src/b.js"]);

// Async file validation
if (await isValidFileAsync("src/app.js")) {
    // file exists and is readable
}
```

#### Parallel Compression (Array Inputs)

The core `minify()` function automatically processes array inputs in parallel:
```ts
// Core handles parallelization internally via Promise.all
await minify({
    compressor: terser,
    input: ["src/a.js", "src/b.js", "src/c.js"],
    output: ["dist/a.min.js", "dist/b.min.js", "dist/c.min.js"],
});
```

#### Custom Parallel Processing

For custom parallel operations:
```ts
// Basic parallel execution
const results = await Promise.all(
    files.map(async (file, index) => {
        const content = await getContentFromFilesAsync(file);
        return run({ settings, content, index });
    })
);

// With error handling per item (use allSettled)
const results = await Promise.allSettled(
    files.map(file => compressSingleFile({ ...settings, input: file }))
);
// Map results back to inputs
results.forEach((result, i) => {
    if (result.status === "fulfilled") {
        console.log(`${files[i]}: success`);
    } else {
        console.error(`${files[i]}: ${result.reason}`);
    }
});
```

#### Concurrency Limits

For large arrays, limit concurrent operations to avoid resource exhaustion:
```ts
// Using p-limit (install: bun add p-limit)
import pLimit from "p-limit";

const limit = pLimit(5); // max 5 concurrent
const results = await Promise.all(
    files.map(file => limit(() => compressSingleFile({ ...settings, input: file })))
);

// Or batch processing
async function processBatches<T>(items: T[], batchSize: number, fn: (item: T) => Promise<unknown>) {
    for (let i = 0; i < items.length; i += batchSize) {
        await Promise.all(items.slice(i, i + batchSize).map(fn));
    }
}
```

**Guidelines:**
- Use `Promise.all` when all operations must succeed (fail-fast)
- Use `Promise.allSettled` when you need results for all items regardless of individual failures
- Limit concurrency to 5-10 for file operations, 2-4 for CPU-intensive compressions
- Always maintain 1:1 mapping between inputs and outputs for traceability

## CLI Usage

```bash
# Basic compression
node-minify --compressor terser --input src/app.js --output dist/app.min.js

# With options
node-minify -c esbuild -i "src/**/*.js" -o dist/bundle.js -t js -O '{"minify":true}'

# Benchmark
node-minify benchmark src/app.js --compressors terser,esbuild,swc,oxc --format json
```

**Benchmark formats**: `console` (default, colored tables), `json`, `markdown`

## Troubleshooting

- **Build fails**: Run `bun run build:deps` first to build `utils` and `run`
- **Type errors**: Ensure `bun run build` completed; types come from compiled `dist/`
- **Test isolation**: Tests use `tests/tmp/` for output files (gitignored)
- **Clean rebuild**: `bun run clean && bun run build`
- **Java compressors fail**: Ensure Java is installed for `yui` and `google-closure-compiler`

## Documentation

- **JSDoc comments**: All exported functions MUST have JSDoc comments with `@param` and `@returns` tags
- **Preserve existing JSDoc**: When refactoring, preserve or update JSDoc comments - never remove them
- **Copyright headers**: All source files must include the copyright header: `/*! node-minify ... MIT Licensed */`

## Anti-Patterns (DO NOT)

- **Never** suppress type errors with `as any`, `@ts-ignore`, `@ts-expect-error`
- **Never** remove JSDoc comments from exported functions
- **Never** use deprecated packages in new code (babel-minify, uglify-es, yui, crass, sqwish)
- **Never** commit without running `bun run lint` first
- **Avoid** synchronous file operations in compressor code (use async variants)

## GitHub Action

The repository includes a reusable GitHub Action at `.github/actions/node-minify/` for CI/CD minification.

### Usage
```yaml
- uses: srod/node-minify@v1
  with:
    input: "src/app.js"
    output: "dist/app.min.js"
    compressor: "terser"  # or esbuild, swc, lightningcss, etc.
    type: "js"            # required for esbuild, yui
```

### Key Behaviors
- **Auto Java**: Automatically sets up Java 17 for `gcc`/`yui` compressors
- **Validation**: Fails fast if `type` missing for compressors that require it
- **Outputs**: `original-size`, `minified-size`, `reduction-percent`, `gzip-size`, `time-ms`

### Files
| File | Purpose |
|------|---------|
| `action.yml` | Action definition, inputs/outputs |
| `packages/action/` | Source code for the action (built to `packages/action/dist/index.js`) |

## CI/CD Workflows

Located in `.github/workflows/`:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `test.yml` | Push/PR | Build, lint, typecheck, test with coverage |
| `publish.yml` | Release | Publish to npm via changesets |
| `test-action.yml` | Push/PR | Test the GitHub Action with real files |
| `codeql.yml` | Schedule | Security scanning |

## Documentation Site

The `docs/` directory is a separate **Astro** site (not part of the main build).

- **Dev**: `cd docs && bun run dev`
- **Build**: `cd docs && bun run build`
- **Deploy**: Cloudflare Pages (automatic on push)
- **Content**: Markdown in `docs/src/content/docs/`
- **Components**: `docs/src/components/` (Astro/React)

See `docs/AGENTS.md` for docs-specific conventions.
