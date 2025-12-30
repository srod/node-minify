<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/swc"><img src="https://img.shields.io/npm/v/@node-minify/swc.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/swc"><img src="https://img.shields.io/npm/dm/@node-minify/swc.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# swc

`swc` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allows you to compress JavaScript files using [SWC](https://swc.rs/), a super-fast Rust-based JavaScript/TypeScript compiler used by Next.js and Parcel.

## Installation

```bash
npm install @node-minify/core @node-minify/swc
```

## Usage

```js
import { minify } from '@node-minify/core';
import { swc } from '@node-minify/swc';

// Minify JavaScript
await minify({
  compressor: swc,
  input: 'foo.js',
  output: 'bar.js'
});

// With source maps
await minify({
  compressor: swc,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    sourceMap: true
  }
});

// With custom options
await minify({
  compressor: swc,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    mangle: false,
    compress: {
      dead_code: true
    }
  }
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/swc.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
