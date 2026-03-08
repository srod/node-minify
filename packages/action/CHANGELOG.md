# @node-minify/action

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
