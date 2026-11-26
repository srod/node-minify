# @node-minify/benchmark

## 11.1.0

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

- Updated dependencies [43c11f7]
- Updated dependencies [33a56ab]
- Updated dependencies [1d5e3ee]
- Updated dependencies [c21e335]
  - @node-minify/core@10.5.0
  - @node-minify/utils@10.5.0

## 10.4.0

### Minor Changes

- 0a51025: feat: add `getFilesizeGzippedRaw` utility and update benchmark defaults
  feat(action): launch `@node-minify/action` GitHub Action

### Patch Changes

- Updated dependencies [2e64877]
- Updated dependencies [3d4d2d0]
- Updated dependencies [0a51025]
  - @node-minify/utils@10.4.0
  - @node-minify/core@10.4.0

## 10.3.0

### Minor Changes

- 3562b75: Add benchmark feature to compare compressor performance.

### Patch Changes

- Updated dependencies [1e06c03]
  - @node-minify/utils@10.3.0
  - @node-minify/core@10.3.0
