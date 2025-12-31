<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/yui"><img src="https://img.shields.io/npm/v/@node-minify/yui.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/yui"><img src="https://img.shields.io/npm/dm/@node-minify/yui.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# YUI Compressor

> **DEPRECATED**: YUI Compressor was deprecated by Yahoo in 2013 and is no longer maintained.
> Please use [`@node-minify/terser`](https://github.com/srod/node-minify/tree/main/packages/terser) for JavaScript or [`@node-minify/cssnano`](https://github.com/srod/node-minify/tree/main/packages/cssnano) for CSS instead.

`Yahoo Compressor` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allow you to compress both JavaScript and CSS files.

## Installation

```bash
npm install @node-minify/core @node-minify/yui
```

## Usage

```js
import { minify } from '@node-minify/core';
import { yui } from '@node-minify/yui';

await minify({
  compressor: yui,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js'
});

await minify({
  compressor: yui,
  type: 'css',
  input: 'foo.css',
  output: 'bar.css'
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/yui.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
