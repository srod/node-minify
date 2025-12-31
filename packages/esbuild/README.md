<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/esbuild"><img src="https://img.shields.io/npm/v/@node-minify/esbuild.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/esbuild"><img src="https://img.shields.io/npm/dm/@node-minify/esbuild.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# esbuild

`esbuild` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allows you to compress both JavaScript and CSS files using [esbuild](https://esbuild.github.io/), an extremely fast JavaScript/CSS bundler and minifier written in Go.

## Installation

```bash
npm install @node-minify/core @node-minify/esbuild
```

## Usage

```js
import { minify } from '@node-minify/core';
import { esbuild } from '@node-minify/esbuild';

// Minify JavaScript
await minify({
  compressor: esbuild,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js'
});

// Minify CSS
await minify({
  compressor: esbuild,
  type: 'css',
  input: 'foo.css',
  output: 'bar.css'
});

// With source maps
await minify({
  compressor: esbuild,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    sourceMap: true
  }
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/esbuild.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
