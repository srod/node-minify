# Getting Started

## Installation

```bash
npm install @node-minify/core # OR yarn add @node-minify/core OR pnpm install @node-minify/core
```

And install the compressor you want

```bash
npm install @node-minify/uglify-js # OR yarn add @node-minify/uglify-js OR pnpm install @node-minify/uglify-js
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
