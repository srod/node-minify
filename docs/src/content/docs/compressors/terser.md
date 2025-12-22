---
title: "terser"
description: "terser for node-minify"
---

`terser` can compress only JavaScript files.

[https://github.com/terser-js/terser](https://github.com/terser-js/terser)

## Installation

```bash
npm install @node-minify/core @node-minify/terser
```

## Usage

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

const result = await minify({
  compressor: terser,
  input: 'foo.js',
  output: 'bar.js'
});
```

## Options

```js
const result = await minify({
  compressor: terser,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    mangle: false,
    output: {},
    compress: {
      drop_console: true
    }
  }
});
```

[Check all options](https://github.com/terser-js/terser)
