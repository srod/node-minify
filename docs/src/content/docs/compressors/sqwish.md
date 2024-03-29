---
title: "sqwish"
description: "sqwish for node-minify"
---

`sqwish` can compress only CSS files.

[https://github.com/ded/sqwish](https://github.com/ded/sqwish)

## Usage

```js
const minify = require('@node-minify/core');
const sqwish = require('@node-minify/sqwish');

minify({
  compressor: sqwish,
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

## Options

```js
minify({
  compressor: sqwish,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    strict: true // strict optimizations
  },
  callback: function(err, min) {}
});
```
