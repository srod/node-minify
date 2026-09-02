# @node-minify/core

## 11.0.0

### Major Changes

- 1a1be73: v11: cleanup major release.

  ### Breaking changes

  - **Minimum Node.js is now 22**: `engines.node` moved from `>=20.0.0` to `>=22.0.0` across all packages. Node 20 reached end-of-life on 2026-04-30 and is no longer covered by CI (the test matrix runs 22.x and 24.x). Upgrade to Node 22 or later.
  - **Removed 5 deprecated compressor packages**: `@node-minify/babel-minify`, `@node-minify/uglify-es`, `@node-minify/yui`, `@node-minify/sqwish`, `@node-minify/crass`. Use the recommended replacements (terser/oxc/swc/esbuild for JS, lightningcss/cssnano for CSS).
  - **Removed `@node-minify/run`**: internal Java/process-spawn helper, no longer used by any compressor.
  - **Removed deprecated type aliases** from `@node-minify/types`: `CompressorReturnType` (use `CompressorResult`) and `MinifyOptions` (use `Settings`).
  - **Google Closure Compiler now uses the `google-closure-compiler` npm API** instead of invoking the Java JAR through `@node-minify/run`. Same flags and output. Note: the npm package still bundles `google-closure-compiler-java`, so Java may still be invoked under the hood — this change removes node-minify's custom Java plumbing, not Java itself.

  ### New features

  - **Compressor support tiers**: shared status registry in `@node-minify/utils` (`recommended` / `supported` / `legacy` / `removed`), surfaced in CLI help and the GitHub Action.
  - **`node-minify doctor`**: read-only CLI command covering every v11 break. Scans `package.json`, source imports, `compressor:` values and workflow YAML for removed/legacy compressors, the removed `@node-minify/run` package, the removed `CompressorReturnType`/`MinifyOptions` type aliases, and `engines.node` ranges that still allow Node below 22. Exits non-zero on errors so it can gate CI.
  - **CLI and Action fail early** when a removed compressor is requested, pointing at the replacement.
  - **GCC runtime controls**: configurable `buffer` limit (kills the child process when stdout/stderr exceeds it) plus hardened process/timeout/error handling.

  ### Migration

  See the [v11 migration guide](https://github.com/srod/node-minify/blob/main/docs/src/content/docs/guides/v11-migration.md), or run `npx --package=@node-minify/cli -- node-minify doctor` in your project.

### Patch Changes

- @node-minify/utils@11.0.0

## 10.5.0

### Patch Changes

- 43c11f7: Fix empty in-memory content handling, benchmark CLI defaults, subprocess close handling, and multi-output routing regressions.
- 33a56ab: Fix multi-format image output path handling when using `$1`, including wildcard image inputs.
- 1d5e3ee: fix: normalize cross-platform path handling in core and utils

  Improves Windows/POSIX path compatibility for output directory resolution, wildcard handling, and public folder/minified path generation.

- Updated dependencies [43c11f7]
- Updated dependencies [1d5e3ee]
- Updated dependencies [c21e335]
  - @node-minify/utils@10.5.0

## 10.4.0

### Patch Changes

- Updated dependencies [2e64877]
- Updated dependencies [3d4d2d0]
- Updated dependencies [0a51025]
  - @node-minify/utils@10.4.0

## 10.3.0

### Patch Changes

- Updated dependencies [1e06c03]
  - @node-minify/utils@10.3.0

## 10.2.0

### Patch Changes

- 3c98739: feat: Add image compression support

  New packages:

  - `@node-minify/sharp`: Convert and compress images to WebP, AVIF, PNG, JPEG using sharp
  - `@node-minify/svgo`: Optimize SVG files using SVGO
  - `@node-minify/imagemin`: Compress PNG, JPEG, GIF images using imagemin

  Core changes:

  - Support for binary (Buffer) content in compressors
  - Multi-format output support (e.g., convert PNG to both WebP and AVIF)
  - New `buffer` and `outputs` fields in CompressorResult type

- Updated dependencies [3c98739]
  - @node-minify/utils@10.2.0

## 10.1.1

### Patch Changes

- eb785b0: Fix npm install error caused by unresolved workspace:\* references in published packages
- Updated dependencies [eb785b0]
  - @node-minify/utils@10.1.1

## 10.1.0

### Patch Changes

- @node-minify/utils@10.1.0

## 10.0.2

### Patch Changes

- 156a53d: test: verify OIDC publishing with fixed workflow config
- Updated dependencies [156a53d]
  - @node-minify/utils@10.0.2

## 10.0.1

### Patch Changes

- d722b73: test: verify OIDC publishing with fixed workflow config
- Updated dependencies [d722b73]
  - @node-minify/utils@10.0.1

## 10.0.0

### Major Changes

- 4406c0c: ## v10.0.0

  ### Breaking Changes

  - **ESM Only**: The package is now pure ESM. Requires Node.js 20+.
  - **Async API**: Callback support has been removed. All `minify()` calls must use `await` or `.then()`.
  - **Named Exports**: All packages now use named exports (e.g., `import { minify } from '@node-minify/core'`).
  - **Sync/Async Split**: Sync functions have been removed or split.
  - **Deprecations**:
    - `@node-minify/babel-minify` (deprecated)
    - `@node-minify/uglify-es` (deprecated)
    - `@node-minify/yui` (deprecated)
    - `@node-minify/sqwish` (deprecated)
    - `@node-minify/crass` (deprecated)

  ### Features & Improvements

  - **Build System**: Switched from `tsup` to `tsdown` for faster and more reliable builds.
  - **Core**: Moved file I/O operations from compressors to core for better consistency.
  - **Output**: Support for array output with input/output validation.
  - **Security**: Replaced `html-minifier` with `html-minifier-next`.
  - **Typings**: Improved TypeScript definitions and coverage.
  - **Dependencies**: Updated all dependencies.

  ### Bug Fixes

  - Fixed various import issues and build warnings.
  - Corrected explicit file extensions in imports.

### Patch Changes

- Updated dependencies [4406c0c]
  - @node-minify/utils@10.0.0

## 10.0.0-next.0

### Major Changes

- 4406c0c: Bump version 10.0.0 next

### Patch Changes

- Updated dependencies [4406c0c]
  - @node-minify/utils@10.0.0-next.0

## 9.0.2

### Patch Changes

- c4fcf63: Fixing packages exports and mkdirp import
- Updated dependencies [c4fcf63]
  - @node-minify/utils@9.0.1

## 9.0.1

### Patch Changes

- ffe20b0: feat(glob): replace glob with fast-glob

## 9.0.0

### Major Changes

- 7ab9745: Version 9.0.0

  - feat(node): remove node 16, add node 18 (#2092) (c9acdaa4a9906d4019d9381129d66235f3139198)
  - feat(biome): add biome (#2113) (50e9ec46c11c218453de743bed2defa9a83ace7b)
  - fix(yui): fixing yui tests (dd8629712c03b0ac1fe2b94acbb95bc896f8f22f)
  - bump dependencies

### Patch Changes

- Updated dependencies [7ab9745]
  - @node-minify/utils@9.0.0
