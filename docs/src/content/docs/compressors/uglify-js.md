---
title: "uglify-js"
description: "uglify-js for node-minify"
---

`uglify-js` can compress only JavaScript files.

[https://github.com/mishoo/UglifyJS](https://github.com/mishoo/UglifyJS)

:::caution
`UglifyJS` only supports JavaScript ECMAScript 5. For ES6+, use [`terser`](/compressors/terser) instead.
:::

## Installation

```bash
npm install @node-minify/core @node-minify/uglify-js
```

## Usage

```js
import { minify } from '@node-minify/core';
import { uglifyjs } from '@node-minify/uglify-js';

const result = await minify({
  compressor: uglifyjs,
  input: 'foo.js',
  output: 'bar.js'
});
```

## Options

```js
const result = await minify({
  compressor: uglifyjs,
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
