<p align="center"><img src="/static/node-minify.png" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/uglify-es"><img src="https://img.shields.io/npm/v/@node-minify/uglify-es.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/uglify-es"><img src="https://img.shields.io/npm/dm/@node-minify/uglify-es.svg"></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/develop/graph/badge.svg"></a><br>
  <a href="https://travis-ci.org/srod/node-minify"><img src="https://img.shields.io/travis/srod/node-minify/master.svg?label=linux"></a>
  <a href="https://dev.azure.com/srodolphe/srodolphe/_build/latest?definitionId=1"><img src="https://dev.azure.com/srodolphe/srodolphe/_apis/build/status/srod.node-minify?branchName=master"></a>
  <a href="https://circleci.com/gh/srod/node-minify/tree/master"><img src="https://circleci.com/gh/srod/node-minify/tree/master.svg?style=shield"></a>
</p>

# uglify-es

`uglify-es` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allow you to compress JavaScript files.

## Installation

```bash
npm install @node-minify/core @node-minify/uglify-es
```

## Usage

```js
const minify = require('@node-minify/core');
const uglifyES = require('@node-minify/uglify-es');

minify({
  compressor: uglifyES,
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Documentation

Visit https://node-minify.2clics.net/compressors/uglify-es.html for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/develop/LICENSE)
