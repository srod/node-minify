---
"@node-minify/minify-html": minor
"@node-minify/cli": minor
---

Add new `@node-minify/minify-html` compressor package

- Wraps [@minify-html/node](https://github.com/wilsonzlin/minify-html), a high-performance Rust-based HTML minifier
- Significantly faster than JavaScript alternatives
- Includes inline CSS minification via lightningcss (enabled by default)
- Inline JS minification available via `minify_js: true` option
- Supports template syntax preservation (Jinja, EJS, ERB, Handlebars)
- Registered in CLI for use with `--compressor minify-html`
