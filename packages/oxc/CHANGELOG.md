# @node-minify/oxc

## 11.1.0

### Patch Changes

- f80a2a3: Internal cleanup with no change to output or reported sizes.

  - `cssnano`, `oxc` and `minify-html` no longer run `validateMinifyResult` on their own result, because `run` already validates it and the libraries always return a string.
  - `no-compress` uses `ensureStringContent`. Array content (several image files) now throws `no-compress compressor does not support array content` instead of `no-compress failed: content must be a string or Buffer but received object`.
  - `@node-minify/utils` builds only its `index` entry, because the package exports map only exposes `.`. The exported names are unchanged.
  - The gzip and brotli size helpers check the file with `isValidFileAsync` instead of the deprecated `isValidFile`.

- Updated dependencies [40b0a9e]
- Updated dependencies [a701d3c]
- Updated dependencies [9da123b]
- Updated dependencies [8e88aec]
- Updated dependencies [8258abb]
- Updated dependencies [f80a2a3]
  - @node-minify/utils@11.1.0

## 11.0.2

### Patch Changes

- ce1a1c2: Fix the oxc compressor ignoring parse errors reported by `oxc-minify`.

  A JavaScript syntax error used to surface as `No content provided`, or as a silent success when `allowEmptyOutput` was set. It now fails with `oxc minification failed: <oxc's message>`.

  - @node-minify/utils@11.0.2

## 11.0.1

### Patch Changes

- @node-minify/utils@11.0.1

## 11.0.0

### Patch Changes

- @node-minify/utils@11.0.0

## 10.5.0

### Patch Changes

- Updated dependencies [43c11f7]
- Updated dependencies [1d5e3ee]
- Updated dependencies [c21e335]
  - @node-minify/utils@10.5.0

## 10.4.0

### Patch Changes

- Updated dependencies [2e64877]
- Updated dependencies [3d4d2d0]
- Updated dependencies [0a51025]
  - @node-minify/utils@10.4.0

## 10.3.0

### Patch Changes

- Updated dependencies [1e06c03]
  - @node-minify/utils@10.3.0

## 10.2.0

### Patch Changes

- Updated dependencies [3c98739]
  - @node-minify/utils@10.2.0

## 10.1.1

### Patch Changes

- eb785b0: Fix npm install error caused by unresolved workspace:\* references in published packages
- Updated dependencies [eb785b0]
  - @node-minify/utils@10.1.1

## 10.1.0

### Minor Changes

- f48b27b: Add oxc compressor for fast JavaScript minification

### Patch Changes

- @node-minify/utils@10.1.0
