# sqwish

`sqwish` can compress only CSS files.

[https://github.com/ded/sqwish](https://github.com/ded/sqwish)

## Usage

```js
const compressor = require('@node-minify/core');
const sqwish = require('@node-minify/sqwish');

compressor.minify({
  compressor: sqwish,
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

## Options

```js
compressor.minify({
  compressor: sqwish,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    strict: true // strict optimizations
  },
  callback: function(err, min) {}
});
```
