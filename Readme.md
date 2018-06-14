<div align="center"><img src="/static/node-minify.png" width="348"></div>

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

It allow you to compress JavaScript and CSS files.

- [Babel-minify](#options-for-babel-minify)
- [Butternut](#options-for-butternut)
- [YUI Compressor](#options-for-yui-compressor)
- [Google Closure Compiler](#options-for-google-closure-compiler)
- [UglifyJS](#options-for-uglifyjs)
- [Clean-css](#options-for-clean-css)
- [CSSO](#options-for-csso)
- [Sqwish](#options-for-sqwish)
- [Crass](#options-for-crass)
- [CLI](#cli) :tada: new in version 3

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

## CLI

You can compress files using the command line.

Usage for one or multiple compressors :

```bash
node-minify --compressor babel-minify --input 'input.js' --output 'output.js'
```

```bash
node-minify --compressor 'babel-minify, uglifyjs, gcc' --input 'input.js' --output 'output.js'
```

Usage for all the compressors :

```bash
node-minify --compressor all --input 'input.js' --output 'output.js'
```

<img src="/static/cli.png" width="784" height="433">

## Concatenate Files

In order to concatenate files, simply pass in an array with the type `no-compress`.

```js
compressor.minify({
  compressor: 'no-compress',
  input: ['foo.js', 'foo2.js', 'foo3.js'],
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Using wildcards

```js
compressor.minify({
  compressor: 'gcc',
  input: 'public/**/*.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Using sync option

```js
compressor.minify({
  compressor: 'yui-js',
  input: 'foo.js',
  output: 'bar.js',
  sync: true,
  callback: function(err, min) {}
});
```

## Using public folder

`publicFolder` allow you to specify an input and output folder.

It avoids you to specify the folder for each file.

```js
compressor.minify({
  compressor: 'gcc',
  publicFolder: './public/',
  input: ['foo.js', 'foo2.js'],
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Max Buffer Size

In some cases you might need a bigger max buffer size (for example when minifying really large files).
By default the buffer is `1000 * 1024` which should be enough. If you however need more buffer, you can simply pass in the desired buffer size as an argument to `compressor.minify` like so:

```js
compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  sync: true,
  buffer: 1000 * 1024,
  callback: function(err, min) {}
});
```

## Passing options

You can pass an object to the compressor.

Please check available options.

### Options for Babel-minify

```js
compressor.minify({
  compressor: 'babel-minify',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    babelrc: 'public/.babelrc',
    presets: ['env']
  },
  callback: function(err, min) {}
});
```

[More informations](https://github.com/babel/minify)

### Options for Butternut

```js
compressor.minify({
  compressor: 'butternut',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    check: false,
    allowDangerousEval: false,
    sourceMap: true
  },
  callback: function(err, min) {}
});
```

[More informations](https://github.com/Rich-Harris/butternut)

### Options for YUI Compressor

```js
compressor.minify({
  compressor: 'yui-js',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    'line-break': 80,
    charset: 'utf8'
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[More informations](http://yui.github.io/yuicompressor)

### Options for Google Closure Compiler

```js
compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    createSourceMap: true,
    compilationLevel: 'WHITESPACE_ONLY',
    languageIn: 'ECMASCRIPT6'
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[More informations](https://github.com/google/closure-compiler-js#flags)

### Options for Google Closure Compiler Legacy (java version)

```js
compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    createSourceMap: true,
    compilation_level: 'WHITESPACE_ONLY',
    language: 'ECMASCRIPT6'
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[More informations](https://developers.google.com/closure/compiler/docs/api-ref)

### Options for UglifyJS

```js
compressor.minify({
  compressor: 'uglifyjs',
  input: 'foo.js',
  output: 'bar.js',
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

### Options for clean-css

```js
compressor.minify({
  compressor: 'clean-css',
  input: 'foo.css',
  output: 'bar.css',
  options: {
    advanced: false, // set to false to disable advanced optimizations - selector & property merging, reduction, etc.
    aggressiveMerging: false // set to false to disable aggressive merging of properties.
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[More informations](https://github.com/jakubpawlowicz/clean-css/tree/3.4)

### Options for CSSO

```js
compressor.minify({
  compressor: 'csso',
  input: 'foo.css',
  output: 'bar.css',
  options: {
    restructureOff: true // turns structure minimization off
  },
  callback: function(err, min) {}
});
```

[More informations](https://github.com/css/csso/blob/master/docs/usage/usage.en.md)

### Options for Sqwish

```js
compressor.minify({
  compressor: 'sqwish',
  input: 'foo.css',
  output: 'bar.css',
  options: {
    strict: true // strict optimizations
  },
  callback: function(err, min) {}
});
```

[More informations](https://github.com/ded/sqwish)

### Options for Crass

```js
compressor.minify({
  compressor: 'crass',
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

[More informations](https://github.com/mattbasta/crass)

## Babel-minify

Babel-minify can compress only JavaScript files.

[https://github.com/babel/minify](https://github.com/babel/minify)

## Butternut

Butternut can compress only JavaScript files.

[https://github.com/Rich-Harris/butternut](https://github.com/Rich-Harris/butternut)

## YUI Compressor

Yahoo Compressor can compress both JavaScript and CSS files.

[http://developer.yahoo.com/yui/compressor/](http://developer.yahoo.com/yui/compressor/)

## Google Closure Compiler

Google Closure Compiler can compress only JavaScript files.

It will throw an error if you try with CSS files.

GCC latest version requires Java 1.8
You can use the legacy version that use Java 1.6

```js
var compressor = require('node-minify');

// Using Google Closure Compiler legacy version for Java 1.6
compressor.minify({
  compressor: 'gcc-legacy',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

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

## Crass

Crass can compress only CSS files.

[https://github.com/mattbasta/crass](https://github.com/mattbasta/crass)

## Warning

It assumes that you have Java installed on your environment for both GCC and YUI Compressor. To check, run:

```bash
java -version
```

How to install:

Mac: [https://java.com/en/download/help/mac_install.xml](https://java.com/en/download/help/mac_install.xml)

Windows: [https://java.com/en/download/help/windows_manual_download.xml](https://java.com/en/download/help/windows_manual_download.xml)

Linux: [https://www.java.com/en/download/help/linux_x64_install.xml](https://www.java.com/en/download/help/linux_x64_install.xml)

## Windows support

Since v0.5.0, a windows support is available for the no-compress option and uglify-js (thanks to pieces029 and benpusherhq)

## License

[MIT](LICENSE)
