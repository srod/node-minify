<p align="center"><img src="/static/node-minify.png" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/node-minify"><img src="https://img.shields.io/npm/v/node-minify.svg"></a>
  <a href="https://npmjs.org/package/node-minify"><img src="https://img.shields.io/npm/dm/node-minify.svg"></a><br>
  <a href="https://travis-ci.org/srod/node-minify"><img src="https://img.shields.io/travis/srod/node-minify/master.svg?label=linux"></a>
  <a href="https://ci.appveyor.com/project/srod/node-minify"><img src="https://img.shields.io/appveyor/ci/srod/node-minify/master.svg?label=windows"></a>
  <a href="https://circleci.com/gh/srod/node-minify/tree/master"><img src="https://circleci.com/gh/srod/node-minify/tree/master.svg?style=shield"></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/develop/graph/badge.svg"></a><br>
  <a href="https://david-dm.org/srod/node-minify"><img src="https://img.shields.io/david/srod/node-minify.svg?style=flat"></a>
  <a href="https://david-dm.org/srod/node-minify#info=devDependencies"><img src="https://img.shields.io/david/dev/srod/node-minify.svg?style=flat"></a>
  <a href="https://greenkeeper.io/"><img src="https://badges.greenkeeper.io/srod/node-minify.svg"></a>
</p>

# Features

It allow you to compress JavaScript, CSS and HTML files.

**JavaScript:**

- [babel-minify](https://node-minify.2clics.net/compressors/babel-minify.html)
- [Google Closure Compiler](https://node-minify.2clics.net/compressors/gcc.html)
- [terser](https://node-minify.2clics.net/compressors/terser.html)
- [uglify-js](https://node-minify.2clics.net/compressors/uglify-js.html)
- [uglify-es](https://node-minify.2clics.net/compressors/uglify-es.html)
- [YUI Compressor](https://node-minify.2clics.net/compressors/yui.html)

**CSS:**

- [clean-css](https://node-minify.2clics.net/compressors/clean-css.html)
- [crass](https://node-minify.2clics.net/compressors/crass.html)
- [CSSO](https://node-minify.2clics.net/compressors/csso.html)
- [sqwish](https://node-minify.2clics.net/compressors/sqwish.html)
- [YUI Compressor](https://node-minify.2clics.net/compressors/yui.html)

**HTML:**

- [html-minifier](https://node-minify.2clics.net/compressors/html-minifier.html)

**Command Line Interface:**

- [CLI](https://node-minify.2clics.net/cli.html) :tada: new in version 3

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

// Using UglifyJS with wildcards
compressor.minify({
  compressor: 'uglifyjs',
  input: './**/*.js',
  output: 'bar.js',
  callback: function(err, min) {}
});

// With Promise
var promise = compressor.minify({
  compressor: 'uglifyjs',
  input: './**/*.js',
  output: 'bar.js'
});

promise.then(function(min) {});
```

[More examples](https://github.com/srod/node-minify/blob/master/examples/server.js)

## Documentation

Visit https://node-minify.2clics.net for full documentation

## Windows support

Since v0.5.0, a windows support is available for the no-compress option and uglify-js (thanks to pieces029 and benpusherhq)

## License

[MIT](LICENSE)
