# @node-minify/action

## 11.1.0

### Patch Changes

- dd7d133: Internal cleanup, no change to behavior.

  - The explicit and auto modes share one per-file minify-and-measure step and one reporting sequence.
  - The Action uses `DEFAULT_IGNORES` from `@node-minify/utils` instead of its own copy.
  - `benchmark-compressors` is parsed with the same helper as the other comma-separated inputs.

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
  - @node-minify/terser@11.1.0
  - @node-minify/esbuild@11.1.0
  - @node-minify/swc@11.1.0
  - @node-minify/oxc@11.1.0

## 11.0.2

### Patch Changes

- Updated dependencies [8903c65]
- Updated dependencies [ce1a1c2]
  - @node-minify/core@11.0.2
  - @node-minify/oxc@11.0.2
  - @node-minify/benchmark@11.0.2
  - @node-minify/esbuild@11.0.2
  - @node-minify/swc@11.0.2
  - @node-minify/terser@11.0.2
  - @node-minify/utils@11.0.2

## 11.0.1

### Patch Changes

- Updated dependencies [f8f121e]
  - @node-minify/core@11.0.1
  - @node-minify/benchmark@11.0.1
  - @node-minify/esbuild@11.0.1
  - @node-minify/oxc@11.0.1
  - @node-minify/swc@11.0.1
  - @node-minify/terser@11.0.1
  - @node-minify/utils@11.0.1

## 11.0.0

### Patch Changes

- Updated dependencies [1a1be73]
  - @node-minify/core@11.0.0
  - @node-minify/benchmark@11.0.0
  - @node-minify/esbuild@11.0.0
  - @node-minify/oxc@11.0.0
  - @node-minify/swc@11.0.0
  - @node-minify/terser@11.0.0
  - @node-minify/utils@11.0.0

## 10.5.0

### Minor Changes

- c21e335: feat: add zero-config auto mode for GitHub Action with smart file discovery

  Adds `auto: true` mode that automatically discovers and minifies files without explicit input/output configuration. Includes smart file type detection, default glob patterns for common source directories, and comprehensive ignore patterns. Also adds ignore patterns support to the wildcards utility function.

### Patch Changes

- 1acf60e: chore(deps): refresh workspace dependencies

  Update dependency ranges across the docs site, GitHub Action package, and published minifier wrappers.
  Align Bun pins used in CI with the repo package manager version and keep the docs CSS compatible with newer lint rules.

- Updated dependencies [43c11f7]
- Updated dependencies [33a56ab]
- Updated dependencies [1acf60e]
- Updated dependencies [1d5e3ee]
- Updated dependencies [c21e335]
  - @node-minify/core@10.5.0
  - @node-minify/utils@10.5.0
  - @node-minify/esbuild@10.5.0
  - @node-minify/swc@10.5.0
  - @node-minify/benchmark@10.5.0
  - @node-minify/oxc@10.5.0
  - @node-minify/terser@10.5.0

## 10.4.0

### Patch Changes

- 3d4d2d0: fix: improve gzip size stream handling in utils
  fix: ensure action build fails if type definitions copy fails
  docs: add documentation for action inputs and java-version migration
- Updated dependencies [2e64877]
- Updated dependencies [3d4d2d0]
- Updated dependencies [0a51025]
  - @node-minify/utils@10.4.0
  - @node-minify/benchmark@10.4.0
  - @node-minify/core@10.4.0
  - @node-minify/esbuild@10.4.0
  - @node-minify/oxc@10.4.0
  - @node-minify/swc@10.4.0
  - @node-minify/terser@10.4.0
