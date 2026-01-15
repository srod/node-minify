# @node-minify/run

## 10.2.0

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
