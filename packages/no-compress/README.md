<p align="center"><img src="/static/node-minify.png" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/no-compress"><img src="https://img.shields.io/npm/v/@node-minify/no-compress.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/no-compress"><img src="https://img.shields.io/npm/dm/@node-minify/no-compress.svg"></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/develop/graph/badge.svg"></a><br>
  <a href="https://dev.azure.com/srodolphe/srodolphe/_build/latest?definitionId=1"><img src="https://dev.azure.com/srodolphe/srodolphe/_apis/build/status/srod.node-minify?branchName=master"></a>
  <a href="https://circleci.com/gh/srod/node-minify/tree/master"><img src="https://circleci.com/gh/srod/node-minify/tree/master.svg?style=shield"></a>
</p>

# no-compress

`no-compress` is used to concatenate files.

## Installation

```bash
npm install @node-minify/core @node-minify/no-compress
```

## Usage

```js
const minify = require('@node-minify/core');
const noCompress = require('@node-minify/no-compress');

minify({
  compressor: noCompress,
  input: ['foo.js', 'foo2.js'],
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Documentation

Visit https://node-minify.2clics.net/options.html#concatenate-files for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/develop/LICENSE)
