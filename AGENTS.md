# AGENTS.md

This file provides guidance to AI coding assistants when working with code in this repository.

## Requirements
- **Node.js**: >=20.0.0
- **Bun**: 1.3.5+

## Package Manager

This branch (`main`) uses **Bun** as the package manager and runtime.

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
- Organize imports automatically on save

## Architecture

This is a Bun monorepo for compressing JavaScript, CSS, and HTML files using various backends.

### Package Structure

**Core packages** (in `/packages`):
- `core` - Main `minify()` function, orchestrates compression
- `utils` - Shared utilities (file operations, gzip sizing)
- `run` - Command execution wrapper for external tools
- `types` - TypeScript type definitions (not compiled)
- `cli` - Command-line interface

**Compressor packages** - Each wraps a specific minification library:
- JS: `esbuild`, `google-closure-compiler`, `oxc`, `swc`, `terser`, `uglify-js`
- CSS: `clean-css`, `cssnano`, `csso`, `esbuild`, `lightningcss`
- HTML: `html-minifier`
- Other: `jsonminify`, `no-compress` (passthrough)

**Deprecated** (still available but unmaintained upstream):
- `babel-minify` - Babel 6 only, use `terser` instead
- `uglify-es` - Unmaintained, use `terser` instead
- `yui` - Java-based, use modern alternatives instead
- `crass` - Unmaintained, use `lightningcss` or `clean-css` instead
- `sqwish` - Unmaintained, use `lightningcss` or `clean-css` instead

### Dependencies

`core` depends on `utils` and `run`. All compressor packages depend on `core`. The build command (`bun run build`) builds `utils` and `run` first, then all other packages.

### Package Pattern

All packages follow the same structure:
```
packages/<name>/
├── src/index.ts      # Main export
├── __tests__/        # Vitest tests
├── package.json
└── tsconfig.json
```

Build: `tsdown` (configured via `tsdown.config.ts`)

## Changesets

This project uses [Changesets](https://github.com/changesets/changesets) for versioning.
- **Add changeset**: `bun run changeset` (interactive prompt)
- **Version packages**: `bun run changeset:version`
- Required for any user-facing changes (features, fixes, breaking changes)

## Adding a New Compressor

1. Create `packages/<name>/` with standard structure
2. Export async function matching `Compressor` type from `@node-minify/types`
3. Function receives `{ settings, content }`, returns `{ code, map? }`
4. Add tests using shared helpers from `tests/fixtures.ts`

Example compressor signature:
```ts
import type { CompressorResult, MinifierOptions } from "@node-minify/types";

export async function myCompressor({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    // ... minification logic
    return { code: minifiedCode, map: sourceMap };
}
```

## Testing

Tests use shared fixtures from `tests/fixtures.ts`:
- `runOneTest({ options, compressorLabel, compressor })` - Run a single test case
- `tests` object contains test suites: `commonjs`, `commoncss`, `commonhtml`, `uglifyjs`, etc.

Types are in `packages/types/src/types.d.ts` (not `index.ts`).

## Key Types

From `@node-minify/types`:
- `Settings` - User-facing options for `minify()` function
- `MinifierOptions` - What compressors receive (`{ settings, content }`)
- `CompressorResult` - What compressors return (`{ code, map? }`)
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
```

## Troubleshooting

- **Build fails**: Run `bun run build:deps` first to build `utils` and `run`
- **Type errors**: Ensure `bun run build` completed; types come from compiled `dist/`
- **Test isolation**: Tests use `tests/tmp/` for output files (gitignored)
- **Clean rebuild**: `bun run clean && bun run build`
