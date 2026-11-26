# @node-minify/svgo

## 11.1.0

### Patch Changes

- 8e88aec: Every built-in compressor now reports a minification failure as `<compressor> minification failed: <original message>`, with the original error as its `cause`. Input checks that run before minifying keep their own messages, such as esbuild's `You must specify a type: js or css` and sharp's and imagemin's `requires Buffer content`. `terser`, `esbuild`, `swc`, `lightningcss`, `uglify-js`, `svgo`, `sharp` and `imagemin` used to throw the library's error as it was or with their own wording (`SVGO optimization failed:`, `Sharp conversion to webp failed:`, `Imagemin returned no output`), so code that matched on that text or on the error's class (for example `instanceof SyntaxError` for lightningcss) should read `error.cause` instead. `@node-minify/utils` also exports `FileOperationError` and `ValidationError`, and `wrapMinificationError` takes an optional `context` string.
- Updated dependencies [40b0a9e]
- Updated dependencies [a701d3c]
- Updated dependencies [9da123b]
- Updated dependencies [8e88aec]
- Updated dependencies [8258abb]
- Updated dependencies [f80a2a3]
  - @node-minify/utils@11.1.0

## 11.0.2

### Patch Changes

- @node-minify/utils@11.0.2

## 11.0.1

### Patch Changes

- @node-minify/utils@11.0.1

## 11.0.0

### Patch Changes

- @node-minify/utils@11.0.0

## 10.5.0

### Patch Changes

- 1acf60e: chore(deps): refresh workspace dependencies

  Update dependency ranges across the docs site, GitHub Action package, and published minifier wrappers.
  Align Bun pins used in CI with the repo package manager version and keep the docs CSS compatible with newer lint rules.

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

## 10.0.0

### Major Changes

- Initial release of SVGO plugin for SVG optimization
- Support for multipass optimization
- Configurable SVGO plugins
- Buffer and string input support
