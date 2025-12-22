<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/uglify-es"><img src="https://img.shields.io/npm/v/@node-minify/uglify-es.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/uglify-es"><img src="https://img.shields.io/npm/dm/@node-minify/uglify-es.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Ddevelop&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/develop/graph/badge.svg"></a>
</p>

# uglify-es

> **DEPRECATED**: This package is deprecated because `uglify-es` is no longer maintained upstream.
> Please use [`@node-minify/terser`](https://github.com/srod/node-minify/tree/develop/packages/terser) instead, which is actively maintained and supports modern JavaScript.

`uglify-es` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allow you to compress JavaScript files.

## Installation

```bash
npm install @node-minify/core @node-minify/uglify-es
```

## Usage

```js
import { minify } from '@node-minify/core';
import { uglifyEs } from '@node-minify/uglify-es';

await minify({
  compressor: uglifyEs,
  input: 'foo.js',
  output: 'bar.js'
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/uglify-es.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/develop/LICENSE)
