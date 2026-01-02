<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/core"><img src="https://img.shields.io/npm/v/@node-minify/core.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/core"><img src="https://img.shields.io/npm/dm/@node-minify/core.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# Features

It allows you to compress JavaScript, CSS, HTML, and image files.

**JavaScript:**

- [esbuild](https://node-minify.2clics.net/compressors/esbuild)
- [Google Closure Compiler](https://node-minify.2clics.net/compressors/gcc)
- [oxc](https://node-minify.2clics.net/compressors/oxc)
- [swc](https://node-minify.2clics.net/compressors/swc)
- [terser](https://node-minify.2clics.net/compressors/terser)
- [uglify-js](https://node-minify.2clics.net/compressors/uglify-js)
- [babel-minify](https://node-minify.2clics.net/compressors/babel-minify) _(deprecated)_
- [uglify-es](https://node-minify.2clics.net/compressors/uglify-es) _(deprecated)_
- [YUI Compressor](https://node-minify.2clics.net/compressors/yui) _(deprecated)_

**CSS:**

- [clean-css](https://node-minify.2clics.net/compressors/clean-css)
- [cssnano](https://node-minify.2clics.net/compressors/cssnano)
- [CSSO](https://node-minify.2clics.net/compressors/csso)
- [esbuild](https://node-minify.2clics.net/compressors/esbuild)
- [lightningcss](https://node-minify.2clics.net/compressors/lightningcss)
- [crass](https://node-minify.2clics.net/compressors/crass) _(deprecated)_
- [sqwish](https://node-minify.2clics.net/compressors/sqwish) _(deprecated)_
- [YUI Compressor](https://node-minify.2clics.net/compressors/yui) _(deprecated)_

**HTML:**

- [html-minifier](https://node-minify.2clics.net/compressors/html-minifier)

**JSON:**

- [jsonminify](https://node-minify.2clics.net/compressors/jsonminify)

**Image:**

- [sharp](https://node-minify.2clics.net/compressors/sharp) - WebP/AVIF conversion
- [svgo](https://node-minify.2clics.net/compressors/svgo) - SVG optimization
- [imagemin](https://node-minify.2clics.net/compressors/imagemin) - PNG/JPEG/GIF compression

**Other:**

- [No compress](https://node-minify.2clics.net/options#concatenate-files)

**Command Line Interface:**

- [CLI](https://node-minify.2clics.net/cli)

**Benchmark:**

- [Benchmark](https://node-minify.2clics.net/benchmark) - Compare compressor performance

## Installation

```bash
npm install @node-minify/core
# Or Yarn
yarn add @node-minify/core
# Or pnpm
pnpm add @node-minify/core
# Or Bun
bun add @node-minify/core
```

And install the compressor(s) you want:

### JavaScript Compressors

```bash
npm install @node-minify/terser        # Recommended - modern, fast, well-maintained
npm install @node-minify/esbuild       # Extremely fast, also handles CSS
npm install @node-minify/swc           # Rust-based, very fast
npm install @node-minify/oxc           # Rust-based, cutting-edge
npm install @node-minify/uglify-js     # Classic, battle-tested
npm install @node-minify/google-closure-compiler  # Advanced optimizations
```

### CSS Compressors

```bash
npm install @node-minify/lightningcss  # Recommended - Rust-based, fastest
npm install @node-minify/esbuild       # Also handles JS
npm install @node-minify/clean-css     # Feature-rich, reliable
npm install @node-minify/cssnano       # PostCSS-based, customizable
npm install @node-minify/csso          # Structural optimizations
```

### HTML & Other

```bash
npm install @node-minify/html-minifier # HTML minification
npm install @node-minify/jsonminify    # JSON minification
```

### Image Compressors

```bash
npm install @node-minify/sharp         # WebP/AVIF conversion, high performance
npm install @node-minify/svgo          # SVG optimization
npm install @node-minify/imagemin      # PNG/JPEG/GIF compression
```

## Quick Start

```js
import { minify } from '@node-minify/core';
import { gcc } from '@node-minify/google-closure-compiler';
import { terser } from '@node-minify/terser';

// Using Google Closure Compiler
const result = await minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js'
});

// Using terser with wildcards
const min = await minify({
  compressor: terser,
  input: 'src/**/*.js',
  output: 'dist/bundle.js'
});

// Using Promise
minify({
  compressor: terser,
  input: 'src/**/*.js',
  output: 'dist/bundle.js'
}).then((min) => {
  console.log(min);
});
```

### In memory

```js
import { minify } from '@node-minify/core';
import { htmlMinifier } from '@node-minify/html-minifier';

const html = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>`;

const min = await minify({
  compressor: htmlMinifier,
  content: html
});
console.log(min);
```

[More examples](https://github.com/srod/node-minify/blob/main/examples/server.js)

## Documentation

Visit https://node-minify.2clics.net for full documentation.

## License

[MIT](LICENSE)
