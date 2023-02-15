---
title: 'Getting Started'
description: 'Getting Started for node-minify'
---

## Installation

```bash
npm install @node-minify/core
yarn add @node-minify/core
pnpm add @node-minify/core
```

And install the compressor you want

```bash
npm install @node-minify/core
# Or Yarn
yarn add @node-minify/core
# Or pnpm
pnpm add @node-minify/core
```

## Quick Start

```js
npm install @node-minify/uglify-js
# Or Yarn
yarn add @node-minify/uglify-js
# Or pnpm
pnpm add @node-minify/uglify-js

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

### In memory

```js
import htmlMinifier from '@node-minify/html-minifier';

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
