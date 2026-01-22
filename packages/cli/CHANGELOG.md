# @node-minify/cli

## 10.4.0

### Minor Changes

- 2e64877: feat: add `allowEmptyOutput` option to skip writing empty output files

  When minifiers produce empty output (e.g., CSS files with only comments), the new `allowEmptyOutput` option allows gracefully skipping the file write instead of throwing a validation error. Also adds `--allow-empty-output` CLI flag.

### Patch Changes

- Updated dependencies [2e64877]
- Updated dependencies [3d4d2d0]
- Updated dependencies [0a51025]
  - @node-minify/utils@10.4.0
  - @node-minify/benchmark@10.4.0
  - @node-minify/core@10.4.0

## 10.3.0

### Minor Changes

- 834e7f2: Add new `@node-minify/minify-html` compressor package

  - Wraps [@minify-html/node](https://github.com/wilsonzlin/minify-html), a high-performance Rust-based HTML minifier
  - Significantly faster than JavaScript alternatives
  - Includes inline CSS minification via lightningcss (enabled by default)
  - Inline JS minification available via `minify_js: true` option
  - Supports template syntax preservation (Jinja, EJS, ERB, Handlebars)
  - Registered in CLI for use with `--compressor minify-html`

- 3562b75: Add benchmark feature to compare compressor performance.

### Patch Changes

- Updated dependencies [3562b75]
- Updated dependencies [1e06c03]
  - @node-minify/benchmark@10.3.0
  - @node-minify/utils@10.3.0
  - @node-minify/core@10.3.0

## 10.2.0

### Patch Changes

- Updated dependencies [3c98739]
  - @node-minify/utils@10.2.0
  - @node-minify/core@10.2.0

## 10.1.1

### Patch Changes

- eb785b0: Fix npm install error caused by unresolved workspace:\* references in published packages
- Updated dependencies [eb785b0]
  - @node-minify/core@10.1.1
  - @node-minify/utils@10.1.1

## 10.1.0

### Patch Changes

- @node-minify/core@10.1.0
- @node-minify/utils@10.1.0

## 10.0.2

### Patch Changes

- 156a53d: test: verify OIDC publishing with fixed workflow config
- Updated dependencies [156a53d]
  - @node-minify/core@10.0.2
  - @node-minify/utils@10.0.2

## 10.0.1

### Patch Changes

- d722b73: test: verify OIDC publishing with fixed workflow config
- Updated dependencies [d722b73]
  - @node-minify/core@10.0.1
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
  - @node-minify/core@10.0.0

## 10.0.0-next.0

### Major Changes

- 4406c0c: Bump version 10.0.0 next

### Patch Changes

- Updated dependencies [4406c0c]
  - @node-minify/utils@10.0.0-next.0
  - @node-minify/core@10.0.0-next.0

## 9.0.2

### Patch Changes

- c4fcf63: Fixing packages exports and mkdirp import
- Updated dependencies [c4fcf63]
  - @node-minify/utils@9.0.1
  - @node-minify/core@9.0.2

## 9.0.1

### Patch Changes

- Updated dependencies [ffe20b0]
  - @node-minify/core@9.0.1

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
  - @node-minify/core@9.0.0
