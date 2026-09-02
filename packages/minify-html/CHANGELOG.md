# @node-minify/minify-html

## 11.0.0

### Patch Changes

- 0ec8a94: Fix `minify-html` throwing `minifyHtmlLib.minify is not a function` at runtime.

  `@minify-html/node` is a CommonJS native addon, so under Node's ESM loader its exports are reachable only through the default export. The compressor called `minify` off the namespace object, which is always `undefined` there, making the package fail on every input when consumed from real Node.

  The bug was masked in CI: the error test mocked `@minify-html/node` with a flat `{ minify }` shape that does not match the real module, and Vitest's CommonJS interop resolved the namespace differently than Node does. The mock now mirrors the real default-export shape, and a regression test asserts the interop directly.

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

### Minor Changes

- 834e7f2: Add new `@node-minify/minify-html` compressor package

  - Wraps [@minify-html/node](https://github.com/wilsonzlin/minify-html), a high-performance Rust-based HTML minifier
  - Significantly faster than JavaScript alternatives
  - Includes inline CSS minification via lightningcss (enabled by default)
  - Inline JS minification available via `minify_js: true` option
  - Supports template syntax preservation (Jinja, EJS, ERB, Handlebars)
  - Registered in CLI for use with `--compressor minify-html`

### Patch Changes

- Updated dependencies [1e06c03]
  - @node-minify/utils@10.3.0
