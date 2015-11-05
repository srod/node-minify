[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][npm-url]
[![Linux Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![Coverage Status][coveralls-image]][coveralls-url]

[![Dependency Status][dependency-image]][dependency-url]
[![devDependency Status][devdependency-image]][devdependency-url]

# Node-minify

A very light minifier NodeJS module.

Support:

- YUI Compressor
- Google Closure Compiler
- UglifyJS
- Clean-css
- CSSO
- Sqwish

It allow you to compress JavaScript and CSS files.

CSS benchmark : http://goalsmashers.github.io/css-minification-benchmark/

I recommend to execute it at boot time for production use.

## Installation

```bash
npm install node-minify
```

## Quick Start

```js
var compressor = require('node-minify');

// Using Google Closure Compiler
compressor.minify({
  type: 'gcc',
  fileIn: 'foo.js',
  fileOut: 'bar.js',
  callback: function (err, min) {}
});

// Using UglifyJS
compressor.minify({
  type: 'uglifyjs',
  fileIn: './**/*.js',
  fileOut: 'bar.js',
  callback: function (err, min) {}
});
```

[More examples](https://github.com/srod/node-minify/blob/master/examples/server.js)

## Concatenate Files

In order to concatenate files, simply pass in an array with the type `no-compress`.

```js
compressor.minify({
  type: 'no-compress',
  fileIn: fileIn: ['foo.js', 'foo2.js', 'foo3.js'],
  fileOut: 'bar.js',
  callback: function (err, min) {}
});
```

## Using wildcards

```js
compressor.minify({
  type: 'gcc',
  fileIn: 'public/**/*.js',
  fileOut: 'bar.js',
  callback: function (err, min) {}
});
```

## Using sync option

```js
compressor.minify({
  type: 'yui-js',
  fileIn: 'foo.js',
  fileOut: 'bar.js',
  sync: true,
  callback: function (err, min) {}
});
```

## Using public folder

`publicFolder` allow you to specify an input and output folder.

It avoids you to specify the folder for each file.

```js
compressor.minify({
  type: 'gcc',
  publicFolder: './public/',
  fileIn: ['foo.js', 'foo2.js'],
  fileOut: 'bar.js',
  callback: function (err, min) {}
});
```

## Max Buffer Size

In some cases you might need a bigger max buffer size (for example when minifying really large files).
By default the buffer is `1000 * 1024` which should be enough. If you however need more buffer, you can simply pass in the desired buffer size as an argument to `compressor.minify` like so:

```js
compressor.minify({
  type: 'gcc',
  fileIn: 'foo.js',
  fileOut: 'bar.js',
  sync: true,
  buffer: 1000 * 1024,
  callback: function (err, min) {}
});
```

## Passing options

You can pass an object to the compressor.

Please check available options.

### Options for YUI Compressor

```js
compressor.minify({
  type: 'yui-js',
  fileIn: 'foo.js',
  fileOut: 'bar.js',
  options: {
    'line-break': 80,
    charset: 'utf8'
    ... // See more information below
  },
  callback: function (err, min) {}
});
```

[More informations](http://yui.github.io/yuicompressor)

### Options for Google Closure Compiler

```js
compressor.minify({
  type: 'gcc',
  fileIn: 'foo.js',
  fileOut: 'bar.js',
  options: {
    compilation_level: 'WHITESPACE_ONLY',
    language: 'ECMASCRIPT6'
    ... // See more information below
  },
  callback: function (err, min) {}
});
```

[More informations](https://developers.google.com/closure/compiler/docs/api-ref)

### Options for UglifyJS

```js
compressor.minify({
  type: 'uglifyjs',
  fileIn: 'foo.js',
  fileOut: 'bar.js',
  options: {
    warnings: true, // pass true to display compressor warnings.
    mangle: false // pass false to skip mangling names.
    output: {} // pass an object if you wish to specify additional output options. The defaults are optimized for best compression.
    compress: false // pass false to skip compressing entirely. Pass an object to specify custom compressor options.
  },
  callback: function (err, min) {}
});
```

[More informations](https://github.com/mishoo/UglifyJS2)

### Options for Clean-css

```js
compressor.minify({
  type: 'clean-css',
  fileIn: 'foo.css',
  fileOut: 'bar.css',
  options: {
    advanced: false, // set to false to disable advanced optimizations - selector & property merging, reduction, etc.
    aggressiveMerging: false // set to false to disable aggressive merging of properties.
    ... // See more information below
  },
  callback: function (err, min) {}
});
```

[More informations](https://github.com/jakubpawlowicz/clean-css/tree/3.4)

### Options for CSSO

```js
compressor.minify({
  type: 'csso',
  fileIn: 'foo.css',
  fileOut: 'bar.css',
  options: {
    restructureOff: true // turns structure minimization off
  },
  callback: function (err, min) {}
});
```

[More informations](https://github.com/css/csso/blob/master/docs/usage/usage.en.md)

### Options for Sqwish

```js
compressor.minify({
  type: 'sqwish',
  fileIn: 'foo.css',
  fileOut: 'bar.css',
  options: {
    strict: true // strict optimizations
  },
  callback: function (err, min) {}
});
```

[More informations](https://github.com/ded/sqwish)

## YUI Compressor

  Yahoo Compressor can compress both JavaScript and CSS files.

  [http://developer.yahoo.com/yui/compressor/](http://developer.yahoo.com/yui/compressor/)

## Google Closure Compiler

  Google Closure Compiler can compress only JavaScript files.

  It will throw an error if you try with CSS files.

  [https://developers.google.com/closure/compiler/](https://developers.google.com/closure/compiler/)

## UglifyJS

  UglifyJS can compress only JavaScript files.

  It will throw an error if you try with CSS files.

  [https://github.com/mishoo/UglifyJS2](https://github.com/mishoo/UglifyJS2)

## Clean-css

  Clean-css can compress only CSS files.

  [https://github.com/GoalSmashers/clean-css](https://github.com/GoalSmashers/clean-css)

## CSSO

  CSSO can compress only CSS files.

  [https://github.com/css/csso](https://github.com/css/csso)

## Sqwish

  Sqwish can compress only CSS files.

  [https://github.com/ded/sqwish](https://github.com/ded/sqwish)

## Warning

  It assumes that you have Java installed on your environment for both GCC and YUI Compressor. To check, run:

```bash
java -version
```

## Windows support

  Since v0.5.0, a windows support is available for the no-compress option and uglify-js (thanks to pieces029 and benpusherhq)

## License

  [MIT](LICENSE)

[npm-version-image]: https://img.shields.io/npm/v/node-minify.svg
[npm-downloads-image]: https://img.shields.io/npm/dm/node-minify.svg
[npm-url]: https://npmjs.org/package/node-minify
[travis-image]: https://img.shields.io/travis/srod/node-minify/master.svg?label=linux
[travis-url]: https://travis-ci.org/srod/node-minify
[appveyor-image]: https://img.shields.io/appveyor/ci/srod/node-minify/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/srod/node-minify
[coveralls-image]: https://img.shields.io/coveralls/srod/node-minify/master.svg
[coveralls-url]: https://coveralls.io/r/srod/node-minify?branch=master
[dependency-image]: https://img.shields.io/david/srod/node-minify.svg?style=flat
[dependency-url]: https://david-dm.org/srod/node-minify
[devdependency-image]: https://img.shields.io/david/dev/srod/node-minify.svg?style=flat
[devdependency-url]: https://david-dm.org/srod/node-minify#info=devDependencies
