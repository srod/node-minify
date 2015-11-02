[![Build Status](https://img.shields.io/travis/srod/node-minify/master.svg?label=linux)](https://travis-ci.org/srod/node-minify)
[![Build status](https://img.shields.io/appveyor/ci/srod/node-minify/master.svg?label=windows)](https://ci.appveyor.com/project/srod/node-minify)
[![Coverage Status](https://coveralls.io/repos/srod/node-minify/badge.svg?branch=master&service=github)](https://coveralls.io/github/srod/node-minify?branch=master)
[![Dependency Status](http://img.shields.io/david/srod/node-minify.svg?style=flat)](https://david-dm.org/srod/node-minify)
[![devDependency Status](http://img.shields.io/david/dev/srod/node-minify.svg?style=flat)](https://david-dm.org/srod/node-minify#info=devDependencies)
[![NPM version](http://img.shields.io/npm/v/node-minify.svg?style=flat)](https://www.npmjs.org/package/node-minify)
[![NPM downloads](https://img.shields.io/npm/dm/node-minify.svg)](http://npm-stat.com/charts.html?package=node-minify)

# Node-minify

A very light minifier NodeJS module.

Support:

- YUI Compressor --version 2.4.7
- Google Closure Compiler --version v20130411
- UglifyJS2
- Clean-css
- CSSO
- Sqwish

It allow you to compress JavaScript and CSS files.

CSS benchmark : http://goalsmashers.github.io/css-minification-benchmark/

I recommend to execute it at boot time for production use.

See `server.js` in `examples/`.

## Installation

```bash
npm install node-minify
```

## Quick Start

```js
var compressor = require('node-minify');

// Using Google Closure
new compressor.minify({
  type: 'gcc',
  fileIn: 'public/js/base.js',
  fileOut: 'public/js-dist/base-min-gcc.js',
  callback: function(err, min){
    console.log(err);
    //console.log(min);
  }
});

// Array
new compressor.minify({
  type: 'gcc',
  fileIn: ['public/js/base.js', 'public/js/base2.js'],
  fileOut: 'public/js-dist/base-onefile-gcc.js',
  callback: function(err, min){
    console.log(err);
    //console.log(min);
  }
});

// Only concatenation of files (no compression)
new compressor.minify({
    type: 'no-compress',
    fileIn: ['public/js/base.js', 'public/js/base2.js'],
    fileOut: 'public/js-dist/base-onefile-gcc.js',
    callback: function(err, min){
      console.log(err);
      //console.log(min);
    }
});

// Using YUI Compressor for CSS
new compressor.minify({
  type: 'yui-css',
  fileIn: 'public/css/base.css',
  fileOut: 'public/css/base-min-yui.css',
  callback: function(err, min){
    console.log(err);
    //console.log(min);
  }
});

// Using YUI Compressor for JS
new compressor.minify({
  type: 'yui-js',
  fileIn: 'public/js/base.js',
  fileOut: 'public/js-dist/base-min-yui.js',
  callback: function(err, min){
    console.log(err);
    //console.log(min);
  }
});

// Using UglifyJS for JS
new compressor.minify({
  type: 'uglifyjs',
  fileIn: 'public/js/base.js',
  fileOut: 'public/js-dist/base-onefile-uglify.js',
  callback: function(err, min){
    console.log(err);
    //console.log(min);
  }
});

// Using Sqwish for CSS
new compressor.minify({
    type: 'sqwish',
  fileIn: ['public/css/base.css', 'public/css/base2.css'],
  fileOut: 'public/css/base-min-sqwish.css',
    callback: function(err, min){
      console.log('Sqwish');
      console.log(err);
      //console.log(min);
    }
});

// Using public folder option
new compressor.minify({
    type: 'yui-js',
    publicFolder: 'public/js/',
    fileIn: 'base.js',
    fileOut: 'public/js-dist/base-min-yui-publicfolder.js',
    callback: function(err, min){
      console.log('YUI JS with publicFolder option');
      console.log(err);
      //console.log(min);
    }
});

// Using Clean-css for CSS
new compressor.minify({
    type: 'clean-css',
  fileIn: ['public/css/base.css', 'public/css/base2.css'],
  fileOut: 'public/css/base-min-cleancss.css',
    callback: function(err, min){
      console.log('Clean-css');
      console.log(err);
      //console.log(min);
    }
});

// Using CSSO for CSS
new compressor.minify({
    type: 'csso',
  fileIn: ['public/css/base.css', 'public/css/base2.css'],
  fileOut: 'public/css/base-min-csso.css',
    callback: function(err, min){
      console.log('CSSO');
      console.log(err);
      //console.log(min);
    }
});
```

## Concatenate Files

In order to concatenate files, simply pass in an array with the file paths to `fileIn`.

```js
fileIn: ['public/js/base.js', 'public/js/base2.js', ...]
```

## Using sync option
```js
new compressor.minify({
  type: 'yui-js',
  publicFolder: 'public/js/',
  fileIn: 'base.js',
  fileOut: 'public/js-dist/base-min-yui-publicfolder.js',
  sync: true,
  callback: function(err, min) {
    console.log('YUI JS with publicFolder option');
    console.log(err);
    //console.log(min);
  }
});
```

## Using wildcards

```js
new compressor.minify({
  type: 'gcc',
  fileIn: 'public/**/*.js',
  fileOut: 'public/js-dist/wildcards-match-gcc.js',
  callback: function(err, min){
    console.log('wildcards match GCC');
    console.log(err);
    //console.log(min);
  }
});
```

## Passing options

You can pass any option/flag you want

```js
options: ['--option=1', '--option=2']

new compressor.minify({
  type: 'gcc',
  language: 'ECMASCRIPT5',
  fileIn: 'public/js/jquery-2.0.3.js',
  fileOut: 'public/js-dist/jquery-2.0.3-gcc.js',
  options: ['--option=1', '--option=2'],
  callback: function(err, min){
    console.log('GCC jquery 2.0');
    console.log(err);
    //console.log(min);
  }
});
```

## Max Buffer Size

In some cases you might need a bigger max buffer size (for example when minifying really large files).
By default the buffer is `1000 * 1024` which should be enough. If you however need more buffer, you can simply pass in the desired buffer size as an argument to `compressor.minify` like so:

```js
new compressor.minify({
  type: 'uglifyjs',
  fileIn: './public/css/base.css',
  fileOut: './public/css/base-min-uglifyjs.css',
  buffer: 1000 * 1024,
  callback: function(err){
    console.log(err);
  }
});
```

## Temp Path

You can define a temporary folder where temporary files will be generated :

```js
new compressor.minify({
  type: 'yui-js',
  fileIn: 'public/js/base.js',
  fileOut: 'public/js-dist/base-min-yui.js',
  tempPath: '/tmp/',
  callback: function(err){
    console.log(err);
  }
});
```

## YUI Compressor

  Yahoo Compressor can compress both JavaScript and CSS files.

  http://developer.yahoo.com/yui/compressor/

## Google Closure Compiler

  Google Closure Compiler can compress only JavaScript files.

  It will throw an error if you try with CSS files.

  https://developers.google.com/closure/compiler/

## UglifyJS

  UglifyJS can compress only JavaScript files.

  It will throw an error if you try with CSS files.

  https://github.com/mishoo/UglifyJS

## Clean-css

  Clean-css can compress only CSS files.

  https://github.com/GoalSmashers/clean-css

## CSSO

  CSSO can compress only CSS files.

  https://github.com/css/csso

## Sqwish

  Sqwish can compress only CSS files.

  https://github.com/ded/sqwish

## Warning

  It assumes you have Java installed on your environment for both GCC and YUI Compressor. To check, run:

```bash
java -version
```

## Windows support

  Since v0.5.0, a windows support is available for the no-compress option and uglify-js (thanks to pieces029 and benpusherhq)
