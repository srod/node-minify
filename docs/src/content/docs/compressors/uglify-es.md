---
title: "uglify-es (Deprecated)"
description: "uglify-es for node-minify - DEPRECATED"
---

:::danger[Deprecated]
**This package is deprecated.** `uglify-es` is no longer maintained upstream (last release: 2017).

Please migrate to [`terser`](/compressors/terser) instead, which is actively maintained and supports modern JavaScript.
:::

`uglify-es` can compress only JavaScript files.

[https://github.com/mishoo/UglifyJS](https://github.com/mishoo/UglifyJS)

## Installation

```bash
npm install @node-minify/core @node-minify/uglify-es
```

## Usage

```js
import { minify } from '@node-minify/core';
import { uglifyes } from '@node-minify/uglify-es';

const result = await minify({
  compressor: uglifyes,
  input: 'foo.js',
  output: 'bar.js'
});
```

## Options

```js
const result = await minify({
  compressor: uglifyes,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    mangle: false,
    output: {},
    compress: false
  }
});
```

[Check all options](https://github.com/mishoo/UglifyJS)
