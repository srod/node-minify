<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/lightningcss"><img src="https://img.shields.io/npm/v/@node-minify/lightningcss.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/lightningcss"><img src="https://img.shields.io/npm/dm/@node-minify/lightningcss.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg"></a>
</p>

# lightningcss

`lightningcss` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allows you to compress CSS files using [Lightning CSS](https://lightningcss.dev/), an extremely fast CSS parser, transformer, and minifier written in Rust by the Parcel team.

## Installation

```bash
npm install @node-minify/core @node-minify/lightningcss
```

## Usage

```js
import { minify } from '@node-minify/core';
import { lightningCss } from '@node-minify/lightningcss';

// Minify CSS
await minify({
  compressor: lightningCss,
  input: 'foo.css',
  output: 'bar.css'
});

// With source maps
await minify({
  compressor: lightningCss,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    sourceMap: true
  }
});

// With browser targets
await minify({
  compressor: lightningCss,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    targets: {
      chrome: 95
    }
  }
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/lightningcss.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
