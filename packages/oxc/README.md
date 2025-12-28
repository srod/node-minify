<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/oxc"><img src="https://img.shields.io/npm/v/@node-minify/oxc.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/oxc"><img src="https://img.shields.io/npm/dm/@node-minify/oxc.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg"></a>
</p>

# oxc

`oxc` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allows you to compress JavaScript files using [OXC](https://oxc.rs/), the Oxidation Compiler - a collection of high-performance JavaScript tools written in Rust.

## Installation

```bash
npm install @node-minify/core @node-minify/oxc
```

## Usage

```js
import { minify } from '@node-minify/core';
import { oxc } from '@node-minify/oxc';

// Minify JavaScript
await minify({
  compressor: oxc,
  input: 'foo.js',
  output: 'bar.js'
});

// With source maps
await minify({
  compressor: oxc,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    sourceMap: true
  }
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/oxc.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
