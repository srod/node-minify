---
title: "jsonminify"
description: "jsonminify for node-minify"
---

`jsonminify` can compress only JSON files.

[https://github.com/fkei/JSON.minify](https://github.com/fkei/JSON.minify)

## Usage

```js
const minify = require('@node-minify/core');
const jsonminify = require('@node-minify/jsonminify');

minify({
  compressor: jsonminify,
  input: 'foo.json',
  output: 'bar.json',
  callback: function(err, min) {}
});
```
