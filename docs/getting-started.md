# Getting Started

## Installation

```bash
npm install @node-minify/core # OR yarn add @node-minify/core
```

And install the compressor you want

```bash
npm install @node-minify/uglify-js # OR yarn add @node-minify/uglify-js
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
  callback: function(err, min) {}
});

// Using UglifyJS
minify({
  compressor: uglifyjs,
  input: './**/*.js',
  output: 'bar.js',
  callback: function(err, min) {}
});

// Using Promise
var promise = minify({
  compressor: uglifyjs,
  input: './**/*.js',
  output: 'bar.js'
});

promise.then(function(min) {});

// Async/Await
async function doMinify() {
  const min = await minify({ compressor: babelMinify, input: 'foo.js', output: 'bar.js' });
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
  callback: function(err, min) {}
});
```

[More examples](https://github.com/srod/node-minify/blob/master/examples/server.js)
