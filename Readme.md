<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/core"><img src="https://img.shields.io/npm/v/@node-minify/core.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/core"><img src="https://img.shields.io/npm/dm/@node-minify/core.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg"></a>
</p>

# Features

It allow you to compress JavaScript, CSS and HTML files.

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

**Other:**

- [No compress](https://node-minify.2clics.net/options#concatenate-files)

**Command Line Interface:**

- [CLI](https://node-minify.2clics.net/cli)

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

And install the compressor you want

```bash
npm install @node-minify/uglify-js
# Or Yarn
yarn add @node-minify/uglify-js
# Or pnpm
pnpm add @node-minify/uglify-js
# Or Bun
bun add @node-minify/uglify-js
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
