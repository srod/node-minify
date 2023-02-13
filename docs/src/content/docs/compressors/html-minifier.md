---
title: "html-minifier"
description: "html-minifier for node-minify"
---

`html-minifier` can compress only HTML files.

[https://github.com/kangax/html-minifier](https://github.com/kangax/html-minifier)

## Usage

```js
const minify = require('@node-minify/core');
const htmlMinifier = require('@node-minify/html-minifier');

minify({
  compressor: htmlMinifier,
  input: 'foo.html',
  output: 'bar.html',
  callback: function(err, min) {}
});
```

## Options

```js
minify({
  compressor: htmlMinifier,
  input: 'foo.html',
  output: 'bar.html',
  options: {
    removeAttributeQuotes: true
  },
  callback: function(err, min) {}
});
```

[Check all options](https://github.com/kangax/html-minifier)
