<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/sqwish"><img src="https://img.shields.io/npm/v/@node-minify/sqwish.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/sqwish"><img src="https://img.shields.io/npm/dm/@node-minify/sqwish.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Ddevelop&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/develop/graph/badge.svg"></a>
</p>

# sqwish

`sqwish` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allow you to compress CSS files.

## Installation

```bash
npm install @node-minify/core @node-minify/sqwish
```

## Usage

```js
const minify = require('@node-minify/core');
const sqwish = require('@node-minify/sqwish');

minify({
  compressor: sqwish,
  input: 'foo.css',
  output: 'bar.css',
  callback: function (err, min) {}
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/sqwish.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/develop/LICENSE)
