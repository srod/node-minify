<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/core"><img src="https://img.shields.io/npm/v/@node-minify/core.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/core"><img src="https://img.shields.io/npm/dm/@node-minify/core.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Ddevelop&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/develop/graph/badge.svg"></a>
</p>

# Features

It allow you to compress JavaScript, CSS and HTML files.

**JavaScript:**

- [babel-minify](https://node-minify.2clics.net/compressors/babel-minify)
- [Google Closure Compiler](https://node-minify.2clics.net/compressors/gcc)
- [terser](https://node-minify.2clics.net/compressors/terser)
- [uglify-js](https://node-minify.2clics.net/compressors/uglify-js)
- [uglify-es](https://node-minify.2clics.net/compressors/uglify-es)
- [YUI Compressor](https://node-minify.2clics.net/compressors/yui)

**CSS:**

- [clean-css](https://node-minify.2clics.net/compressors/clean-css)
- [crass](https://node-minify.2clics.net/compressors/crass)
- [cssnano](https://node-minify.2clics.net/compressors/cssnano)
- [CSSO](https://node-minify.2clics.net/compressors/csso)
- [sqwish](https://node-minify.2clics.net/compressors/sqwish)
- [YUI Compressor](https://node-minify.2clics.net/compressors/yui)

**HTML:**

- [html-minifier](https://node-minify.2clics.net/compressors/html-minifier)

**Command Line Interface:**

- [CLI](https://node-minify.2clics.net/cli)

## Installation

```bash
npm install @node-minify/core # OR yarn add @node-minify/core OR pnpm add @node-minify/core
```

And install the compressor you want

```bash
npm install @node-minify/uglify-js # OR yarn add @node-minify/uglify-js OR pnpm add @node-minify/uglify-js
```

## Quick Start

```js
const minify = require('@node-minify/core');
const gcc = require('@node-minify/google-closure-compiler');
const uglifyjs = require('@node-minify/uglify-js');

// Using Google Closure Compiler
minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js',
  callback: function (err, min) {}
});

// Using UglifyJS
minify({
  compressor: uglifyjs,
  input: './**/*.js',
  output: 'bar.js',
  callback: function (err, min) {}
});

// Using Promise
var promise = minify({
  compressor: uglifyjs,
  input: './**/*.js',
  output: 'bar.js'
});

promise.then(function (min) {});

// Async/Await
async function doMinify() {
  const min = await minify({ compressor: uglifyjs, input: 'foo.js', output: 'bar.js' });
}
```

### ES2015+

```js
import minify from '@node-minify/core';
import gcc from '@node-minify/google-closure-compiler';

minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js',
  callback: function (err, min) {}
});
```

### In memory

```js
const htmlMinifier = require('@node-minify/html-minifier');

const html = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>`;

minify({
  compressor: htmlMinifier,
  content: html
}).then(function (min) {
  console.log('html min');
  console.log(min);
});
```

[More examples](https://github.com/srod/node-minify/blob/master/examples/server.js)

## Documentation

Visit https://node-minify.2clics.net for full documentation.

## License

[MIT](LICENSE)
