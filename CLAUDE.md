# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Requirements
- **Node.js**: >=20.0.0
- **Bun**: 1.3.5+

## Package Manager

This branch (`develop`) uses **Bun** as the package manager and runtime. The `main` branch uses pnpm.

## Commands
- **Install**: `bun install`
- **Build**: `bun run build`
- **Lint**: `bun run lint` | **Format**: `bun run format`
- **Test all**: `bun run test`
- **Test single package**: `bun test packages/<name>` (e.g., `bun test packages/core`)
- **Test single file**: `bun test packages/core/__tests__/core.test.ts`
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
- JS: `babel-minify`, `google-closure-compiler`, `terser`, `uglify-js`, `uglify-es`
- CSS: `clean-css`, `crass`, `cssnano`, `csso`, `sqwish`
- HTML: `html-minifier`
- Other: `yui` (JS/CSS), `jsonminify`, `no-compress` (passthrough)

**Deprecated** (still available but unmaintained upstream):
- `babel-minify` - Babel 6 only, use `terser` instead
- `uglify-es` - Unmaintained, use `terser` instead

### Dependencies

`core` depends on `utils` and `run`. All compressor packages depend on `core`. The build script (`scripts/build-packages.js`) builds `utils` and `run` first, then all other packages in parallel.

### Package Pattern

All packages follow the same structure:
```
packages/<name>/
├── src/index.ts      # Main export
├── __tests__/        # Vitest tests
├── package.json
└── tsconfig.json
```

Build: `tsup src/index.ts --format esm --dts --clean`
