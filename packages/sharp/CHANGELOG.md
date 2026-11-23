# @node-minify/sharp

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
