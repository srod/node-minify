# Getting Started

## Installation

```bash
npm install node-minify # OR yarn add node-minify
```

## Quick Start

```js
var compressor = require('node-minify');

// Using Google Closure Compiler
compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});

// Using UglifyJS
compressor.minify({
  compressor: 'uglifyjs',
  input: './**/*.js',
  output: 'bar.js',
  callback: function(err, min) {}
});

// Using Promise
var promise = compressor.minify({
  compressor: 'uglifyjs',
  input: './**/*.js',
  output: 'bar.js'
});

promise.then(function(min) {});
```

[More examples](https://github.com/srod/node-minify/blob/master/examples/server.js)
