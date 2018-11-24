# GCC

`Google Closure Compiler` can compress only JavaScript files.

[https://developers.google.com/closure/compiler/](https://developers.google.com/closure/compiler/)

## Usage

```js
const minify = require('@node-minify/core');
const gcc = require('@node-minify/google-closure-compiler');

minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

[https://www.npmjs.com/package/google-closure-compiler-js](https://www.npmjs.com/package/google-closure-compiler-js)

## Options

```js
minify({
  compressor: gcc,
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

[Check all options](https://github.com/google/closure-compiler-js#flags)
