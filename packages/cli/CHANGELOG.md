# @node-minify/cli

## 11.1.0

### Minor Changes

- 8258abb: `csso`, `imagemin` and `uglify-js` move from the supported tier to the legacy tier, because they are removed in v12. `node-minify doctor` now warns that each is removed in v12 and names its replacement (`lightningcss` or `cssnano`, `sharp` or `svgo` for SVG, and `terser`), and the compressor list in `node-minify --help` says the same. `jsonminify` moves from the legacy tier back to the supported tier, so `doctor` no longer warns about it. All four keep working in v11, and nothing extra is printed when you run them. In `@node-minify/utils`, `getCompressorsByStatus` and `COMPRESSOR_REGISTRY` return the new tiers, and a legacy entry with a `replacement` is removed in the next major version.

### Patch Changes

- eb58f73: Internal cleanup, no change to output.

  - `benchmark` measures each gzip and brotli size once instead of twice. The reported sizes are unchanged.
  - `cli` prints the three compressor tiers in `--help` from one loop. The text is unchanged from before this cleanup.
  - `core` validates the entries of an array `input` once, in `setup`, instead of a second time before compressing.
  - `sharp` no longer caches the lazily imported `sharp` module itself, because Node already does.

- 47f2880: `benchmark` detects the file type from each input file's extension when `type` is not given, so `node-minify benchmark src/app.js -c terser,esbuild` no longer reports esbuild as failed with `You must specify a type: js or css`. `.js .mjs .cjs .jsx` give `js`, `.css` gives `css`, `.html .htm` give `html`. An explicit `type` still wins, and other extensions pass no type as before. The `benchmark -t` help text says so.
- a701d3c: Drop the `gzip-size` and `chalk` dependencies in favor of Node built-ins. Reported gzip and brotli sizes are unchanged (gzip still uses level 9, as `gzip-size` did), and so is terminal output, with two exceptions: the CLI now honors `NO_COLOR`, and on Node 22.0–22.7 redirected CLI output can contain color codes (benchmark files written with `--output` are still stripped).
- 9da123b: Removed compressors (such as `yui`) now fail the same way everywhere, including `resolveCompressor`, with one message naming the replacement. The benchmark now reports the resolver's actual error for a compressor it cannot load instead of "Compressor not found or not installed". `@node-minify/utils` also exports a `CompressorName` type, and `COMPRESSOR_REGISTRY` is now the single list of compressors, including the removed ones and their replacements: `resolveCompressor` (used by the CLI, the Action and the benchmark), the CLI's compressor list and `doctor` all read it.
- Updated dependencies [eb58f73]
- Updated dependencies [47f2880]
- Updated dependencies [40b0a9e]
- Updated dependencies [a701d3c]
- Updated dependencies [9da123b]
- Updated dependencies [8e88aec]
- Updated dependencies [8258abb]
- Updated dependencies [f80a2a3]
  - @node-minify/benchmark@11.1.0
  - @node-minify/core@11.1.0
  - @node-minify/utils@11.1.0

## 11.0.2

### Patch Changes

- Updated dependencies [8903c65]
  - @node-minify/core@11.0.2
  - @node-minify/benchmark@11.0.2
  - @node-minify/utils@11.0.2

## 11.0.1

### Patch Changes

- 757524b: `node-minify benchmark`: `-c`, `-n`, `-f`, `-o` and `-t` now require a value. A bare `-o` used to run the whole benchmark and then crash on `path.dirname(true)`, and a bare `-c` crashed on `split`; both are now rejected up front with "argument missing".
- f8f121e: - `@node-minify/core`, `@node-minify/types`: Stop supplying a hidden 1 MB default `buffer` in `setup()`, allowing Google Closure Compiler to use its own 100 MB per-stream limit unless a caller specifies `buffer` (custom compressors reading `settings.buffer` must now handle `undefined`).
  - `@node-minify/sharp`: Await `converter.toBuffer()` inside `try` so async encoding failures report the target format (`Sharp conversion to <format> failed: …`) in both single-format and multi-format runs.
  - `@node-minify/cli`: Remove duplicate `Compression failed:` error wrapping in `compress()` so failed CLI runs print the prefix once.
  - `@node-minify/benchmark`: Write temporary benchmark outputs to an isolated `os.tmpdir()` directory removed in `finally` instead of next to the input file.
  - `@node-minify/benchmark`, `@node-minify/cli`: Honor `output` / `-o` and `format` / `-f` by writing the formatted benchmark report to disk (creating parent directories and stripping ANSI escape codes) instead of printing to stdout, and enable Commander positional options so `-c`, `-o`, and `-t` reach the `benchmark` subcommand. Root-only flags such as `-s`, `-O` or `-i` placed after `benchmark` had no effect on it and are now rejected as unknown options.
- Updated dependencies [f8f121e]
  - @node-minify/core@11.0.1
  - @node-minify/benchmark@11.0.1
  - @node-minify/utils@11.0.1

## 11.0.0

### Patch Changes

- Updated dependencies [1a1be73]
  - @node-minify/core@11.0.0
  - @node-minify/benchmark@11.0.0
  - @node-minify/utils@11.0.0

## 10.5.0

### Patch Changes

- 43c11f7: Fix empty in-memory content handling, benchmark CLI defaults, subprocess close handling, and multi-output routing regressions.
- Updated dependencies [43c11f7]
- Updated dependencies [33a56ab]
- Updated dependencies [1d5e3ee]
- Updated dependencies [c21e335]
  - @node-minify/core@10.5.0
  - @node-minify/utils@10.5.0
  - @node-minify/benchmark@10.5.0

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
