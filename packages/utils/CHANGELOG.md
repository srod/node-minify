# @node-minify/utils

## 11.1.0

### Minor Changes

- 40b0a9e: Every export that v12 removes is now marked `@deprecated`, and editors show it struck through. All of them keep working exactly as in 11.0.x through v11, and none of them emits a new deprecation warning at runtime.

  | Package              | Deprecated export                                                                  | Use instead                                                                                                                                                                          |
  | -------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `@node-minify/utils` | `readFile` (every overload)                                                        | `readFileAsync`                                                                                                                                                                      |
  | `@node-minify/utils` | `writeFile`                                                                        | `writeFileAsync`                                                                                                                                                                     |
  | `@node-minify/utils` | `getContentFromFiles`                                                              | `getContentFromFilesAsync`                                                                                                                                                           |
  | `@node-minify/utils` | `isValidFile`                                                                      | `isValidFileAsync`                                                                                                                                                                   |
  | `@node-minify/utils` | `deleteFile`                                                                       | `fs.promises.unlink`                                                                                                                                                                 |
  | `@node-minify/utils` | `getSourceMapBoolean`                                                              | `extractSourceMapOption`                                                                                                                                                             |
  | `@node-minify/utils` | `tryResolveBuiltIn`, `tryResolveNpmPackage`, `tryResolveLocalFile`                 | `resolveCompressor`                                                                                                                                                                  |
  | `@node-minify/utils` | `getKnownExportName`                                                               | `getCompressorEntry(name)?.exportName`, with the canonical name: `getCompressorEntry` does not resolve aliases, so `"gcc"` returns `undefined` and needs `"google-closure-compiler"` |
  | `@node-minify/utils` | `isLocalPath`                                                                      | none (`resolveCompressor` accepts local paths)                                                                                                                                       |
  | `@node-minify/utils` | `validateMinifyResult`                                                             | none (`run` already validates every compressor's result)                                                                                                                             |
  | `@node-minify/utils` | `buildArgs`, `toBuildArgsOptions`, `BuildArgsOptions`                              | none                                                                                                                                                                                 |
  | `@node-minify/utils` | `warnDeprecation`, `resetDeprecationWarnings`                                      | none                                                                                                                                                                                 |
  | `@node-minify/utils` | `WildcardOptions` (the type of the object form of the `wildcards` second argument) | none (pass the public folder as a string)                                                                                                                                            |
  | `@node-minify/utils` | `WildcardOptions.publicFolder`                                                     | pass the public folder as a string: `wildcards(input, publicFolder)`                                                                                                                 |
  | `@node-minify/utils` | `WildcardOptions.ignore`                                                           | none                                                                                                                                                                                 |
  | `@node-minify/types` | `ImageFormat`                                                                      | none                                                                                                                                                                                 |
  | `@node-minify/types` | `Settings.option` (the CLI's raw `-O` string)                                      | `options` (v12 moves the field to the CLI's own type)                                                                                                                                |

  `wildcards` itself is not deprecated, only its object form. These exports are removed in v12.

- 9da123b: Removed compressors (such as `yui`) now fail the same way everywhere, including `resolveCompressor`, with one message naming the replacement. The benchmark now reports the resolver's actual error for a compressor it cannot load instead of "Compressor not found or not installed". `@node-minify/utils` also exports a `CompressorName` type, and `COMPRESSOR_REGISTRY` is now the single list of compressors, including the removed ones and their replacements: `resolveCompressor` (used by the CLI, the Action and the benchmark), the CLI's compressor list and `doctor` all read it.
- 8e88aec: Every built-in compressor now reports a minification failure as `<compressor> minification failed: <original message>`, with the original error as its `cause`. Input checks that run before minifying keep their own messages, such as esbuild's `You must specify a type: js or css` and sharp's and imagemin's `requires Buffer content`. `terser`, `esbuild`, `swc`, `lightningcss`, `uglify-js`, `svgo`, `sharp` and `imagemin` used to throw the library's error as it was or with their own wording (`SVGO optimization failed:`, `Sharp conversion to webp failed:`, `Imagemin returned no output`), so code that matched on that text or on the error's class (for example `instanceof SyntaxError` for lightningcss) should read `error.cause` instead. `@node-minify/utils` also exports `FileOperationError` and `ValidationError`, and `wrapMinificationError` takes an optional `context` string.
- 8258abb: `csso`, `imagemin` and `uglify-js` move from the supported tier to the legacy tier, because they are removed in v12. `node-minify doctor` now warns that each is removed in v12 and names its replacement (`lightningcss` or `cssnano`, `sharp` or `svgo` for SVG, and `terser`), and the compressor list in `node-minify --help` says the same. `jsonminify` moves from the legacy tier back to the supported tier, so `doctor` no longer warns about it. All four keep working in v11, and nothing extra is printed when you run them. In `@node-minify/utils`, `getCompressorsByStatus` and `COMPRESSOR_REGISTRY` return the new tiers, and a legacy entry with a `replacement` is removed in the next major version.

### Patch Changes

- a701d3c: Drop the `gzip-size` and `chalk` dependencies in favor of Node built-ins. Reported gzip and brotli sizes are unchanged (gzip still uses level 9, as `gzip-size` did), and so is terminal output, with two exceptions: the CLI now honors `NO_COLOR`, and on Node 22.0–22.7 redirected CLI output can contain color codes (benchmark files written with `--output` are still stripped).
- f80a2a3: Internal cleanup with no change to output or reported sizes.

  - `cssnano`, `oxc` and `minify-html` no longer run `validateMinifyResult` on their own result, because `run` already validates it and the libraries always return a string.
  - `no-compress` uses `ensureStringContent`. Array content (several image files) now throws `no-compress compressor does not support array content` instead of `no-compress failed: content must be a string or Buffer but received object`.
  - `@node-minify/utils` builds only its `index` entry, because the package exports map only exposes `.`. The exported names are unchanged.
  - The gzip and brotli size helpers check the file with `isValidFileAsync` instead of the deprecated `isValidFile`.

## 11.0.2

## 11.0.1

## 11.0.0

## 10.5.0

### Minor Changes

- c21e335: feat: add zero-config auto mode for GitHub Action with smart file discovery

  Adds `auto: true` mode that automatically discovers and minifies files without explicit input/output configuration. Includes smart file type detection, default glob patterns for common source directories, and comprehensive ignore patterns. Also adds ignore patterns support to the wildcards utility function.

### Patch Changes

- 43c11f7: Fix empty in-memory content handling, benchmark CLI defaults, subprocess close handling, and multi-output routing regressions.
- 1d5e3ee: fix: normalize cross-platform path handling in core and utils

  Improves Windows/POSIX path compatibility for output directory resolution, wildcard handling, and public folder/minified path generation.

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
