# @node-minify/minify-html

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
