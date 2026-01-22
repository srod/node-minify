# @node-minify/utils

## 10.4.0

### Minor Changes

- 2e64877: feat: add `allowEmptyOutput` option to skip writing empty output files

  When minifiers produce empty output (e.g., CSS files with only comments), the new `allowEmptyOutput` option allows gracefully skipping the file write instead of throwing a validation error. Also adds `--allow-empty-output` CLI flag.

- 0a51025: feat: add `getFilesizeGzippedRaw` utility and update benchmark defaults
  feat(action): launch `@node-minify/action` GitHub Action

### Patch Changes

- 3d4d2d0: fix: improve gzip size stream handling in utils
  fix: ensure action build fails if type definitions copy fails
  docs: add documentation for action inputs and java-version migration

## 10.3.0

### Minor Changes

- 1e06c03: Add `resolveCompressor` utility for dynamic compressor loading

  - Resolves built-in @node-minify compressors by name (e.g., "terser", "esbuild")
  - Supports npm packages as custom compressors
  - Supports local file paths (e.g., "./my-compressor.js")
  - Intelligent export detection: known export, camelCase name, 'compressor', default, or first function
  - Also exports `isBuiltInCompressor` and `getKnownExportName` helpers

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

## 10.1.1

### Patch Changes

- eb785b0: Fix npm install error caused by unresolved workspace:\* references in published packages

## 10.1.0

## 10.0.2

### Patch Changes

- 156a53d: test: verify OIDC publishing with fixed workflow config

## 10.0.1

### Patch Changes

- d722b73: test: verify OIDC publishing with fixed workflow config

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

## 10.0.0-next.0

### Major Changes

- 4406c0c: Bump version 10.0.0 next

## 9.0.1

### Patch Changes

- c4fcf63: Fixing packages exports and mkdirp import

## 9.0.0

### Major Changes

- 7ab9745: Version 9.0.0

  - feat(node): remove node 16, add node 18 (#2092) (c9acdaa4a9906d4019d9381129d66235f3139198)
  - feat(biome): add biome (#2113) (50e9ec46c11c218453de743bed2defa9a83ace7b)
  - fix(yui): fixing yui tests (dd8629712c03b0ac1fe2b94acbb95bc896f8f22f)
  - bump dependencies
