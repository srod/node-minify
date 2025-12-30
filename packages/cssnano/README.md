<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/cssnano"><img src="https://img.shields.io/npm/v/@node-minify/cssnano.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/cssnano"><img src="https://img.shields.io/npm/dm/@node-minify/cssnano.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg"></a>
</p>

# cssnano

`cssnano` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allow you to compress CSS files.

## Installation

```bash
npm install @node-minify/core @node-minify/cssnano
```

## Usage

```js
import { minify } from '@node-minify/core';
import { cssnano } from '@node-minify/cssnano';

await minify({
  compressor: cssnano,
  input: 'foo.css',
  output: 'bar.css'
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/cssnano.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
