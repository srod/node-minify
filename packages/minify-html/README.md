<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/minify-html"><img src="https://img.shields.io/npm/v/@node-minify/minify-html.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/minify-html"><img src="https://img.shields.io/npm/dm/@node-minify/minify-html.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# minify-html

`@node-minify/minify-html` is a plugin for [`node-minify`](https://github.com/srod/node-minify) that uses the high-performance Rust-based [@minify-html/node](https://github.com/wilsonzlin/minify-html) library.

## Features

- **Very fast**: Written in Rust, significantly faster than JavaScript alternatives
- **Smart minification**: Context-aware whitespace handling
- **Inline CSS/JS**: Uses lightningcss and oxc for embedded code minification
- **Template support**: Preserves Jinja, EJS, ERB, Handlebars syntax

## Installation

```bash
npm install @node-minify/core @node-minify/minify-html
```

## Usage

```js
import { minify } from '@node-minify/core';
import { minifyHtml } from '@node-minify/minify-html';

await minify({
  compressor: minifyHtml,
  input: 'foo.html',
  output: 'bar.html'
});
```

## Options

All options from [@minify-html/node](https://docs.rs/minify-html/latest/minify_html/struct.Cfg.html) are supported.

### Defaults

| Option | Default | Description |
|--------|---------|-------------|
| `minify_css` | `true` | Minify inline CSS |
| `minify_js` | `true` | Minify inline JavaScript |

### Example with Options

```js
await minify({
  compressor: minifyHtml,
  input: 'foo.html',
  output: 'bar.html',
  options: {
    keep_comments: true,
    keep_closing_tags: true,
    preserve_brace_template_syntax: true
  }
});
```

## Documentation

Visit https://node-minify.2clics.net for full documentation.

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
