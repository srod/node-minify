# @node-minify/sharp

## 11.1.0

### Minor Changes

- d7c8ad4: Add `gif` as an output format, as `format: "gif"` or inside `formats`. This gives `@node-minify/imagemin` users, which is removed in v12, a GIF path in v11. sharp re-encodes the image with libvips instead of optimizing the GIF losslessly like gifsicle, so output sizes differ from imagemin's. Animated GIFs keep all their frames. `effort` (1-10, default 7) is the only option that applies to GIF. Other output formats are unchanged.

### Patch Changes

- eb58f73: Internal cleanup, no change to output.

  - `benchmark` measures each gzip and brotli size once instead of twice. The reported sizes are unchanged.
  - `cli` prints the three compressor tiers in `--help` from one loop. The text is unchanged from before this cleanup.
  - `core` validates the entries of an array `input` once, in `setup`, instead of a second time before compressing.
  - `sharp` no longer caches the lazily imported `sharp` module itself, because Node already does.

- 8e88aec: Every built-in compressor now reports a minification failure as `<compressor> minification failed: <original message>`, with the original error as its `cause`. Input checks that run before minifying keep their own messages, such as esbuild's `You must specify a type: js or css` and sharp's and imagemin's `requires Buffer content`. `terser`, `esbuild`, `swc`, `lightningcss`, `uglify-js`, `svgo`, `sharp` and `imagemin` used to throw the library's error as it was or with their own wording (`SVGO optimization failed:`, `Sharp conversion to webp failed:`, `Imagemin returned no output`), so code that matched on that text or on the error's class (for example `instanceof SyntaxError` for lightningcss) should read `error.cause` instead. `@node-minify/utils` also exports `FileOperationError` and `ValidationError`, and `wrapMinificationError` takes an optional `context` string.
- Updated dependencies [eb58f73]
- Updated dependencies [40b0a9e]
- Updated dependencies [a701d3c]
- Updated dependencies [9da123b]
- Updated dependencies [8e88aec]
- Updated dependencies [8258abb]
- Updated dependencies [f80a2a3]
  - @node-minify/core@11.1.0
  - @node-minify/utils@11.1.0

## 11.0.2

### Patch Changes

- Updated dependencies [8903c65]
  - @node-minify/core@11.0.2
  - @node-minify/utils@11.0.2

## 11.0.1

### Patch Changes

- f8f121e: - `@node-minify/core`, `@node-minify/types`: Stop supplying a hidden 1 MB default `buffer` in `setup()`, allowing Google Closure Compiler to use its own 100 MB per-stream limit unless a caller specifies `buffer` (custom compressors reading `settings.buffer` must now handle `undefined`).
  - `@node-minify/sharp`: Await `converter.toBuffer()` inside `try` so async encoding failures report the target format (`Sharp conversion to <format> failed: …`) in both single-format and multi-format runs.
  - `@node-minify/cli`: Remove duplicate `Compression failed:` error wrapping in `compress()` so failed CLI runs print the prefix once.
  - `@node-minify/benchmark`: Write temporary benchmark outputs to an isolated `os.tmpdir()` directory removed in `finally` instead of next to the input file.
  - `@node-minify/benchmark`, `@node-minify/cli`: Honor `output` / `-o` and `format` / `-f` by writing the formatted benchmark report to disk (creating parent directories and stripping ANSI escape codes) instead of printing to stdout, and enable Commander positional options so `-c`, `-o`, and `-t` reach the `benchmark` subcommand. Root-only flags such as `-s`, `-O` or `-i` placed after `benchmark` had no effect on it and are now rejected as unknown options.
- Updated dependencies [f8f121e]
  - @node-minify/core@11.0.1
  - @node-minify/utils@11.0.1

## 11.0.0

### Patch Changes

- Updated dependencies [1a1be73]
  - @node-minify/core@11.0.0
  - @node-minify/utils@11.0.0

## 10.5.0

### Patch Changes

- 1acf60e: chore(deps): refresh workspace dependencies

  Update dependency ranges across the docs site, GitHub Action package, and published minifier wrappers.
  Align Bun pins used in CI with the repo package manager version and keep the docs CSS compatible with newer lint rules.

- Updated dependencies [43c11f7]
- Updated dependencies [33a56ab]
- Updated dependencies [1d5e3ee]
- Updated dependencies [c21e335]
  - @node-minify/core@10.5.0
  - @node-minify/utils@10.5.0

## 10.4.0

### Patch Changes

- Updated dependencies [2e64877]
- Updated dependencies [3d4d2d0]
- Updated dependencies [0a51025]
  - @node-minify/utils@10.4.0
  - @node-minify/core@10.4.0

## 10.3.0

### Patch Changes

- Updated dependencies [1e06c03]
  - @node-minify/utils@10.3.0
  - @node-minify/core@10.3.0

## 10.2.0

### Minor Changes

- 3c98739: feat: Add image compression support

  New packages:

  - `@node-minify/sharp`: Convert and compress images to WebP, AVIF, PNG, JPEG using sharp
  - `@node-minify/svgo`: Optimize SVG files using SVGO
  - `@node-minify/imagemin`: Compress PNG, JPEG, GIF images using imagemin

  Core changes:

  - Support for binary (Buffer) content in compressors
  - Multi-format output support (e.g., convert PNG to both WebP and AVIF)
  - New `buffer` and `outputs` fields in CompressorResult type

### Patch Changes

- Updated dependencies [3c98739]
  - @node-minify/utils@10.2.0
  - @node-minify/core@10.2.0

## 10.0.0

### Major Changes

- Initial release of sharp image compression plugin
- Support for WebP, AVIF, PNG, and JPEG output formats
- Multi-format conversion (e.g., PNG to both WebP and AVIF)
- Quality, lossless, and effort options
