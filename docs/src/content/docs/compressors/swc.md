---
title: "swc"
description: "swc for node-minify"
---

`swc` can compress only JavaScript files. It's extremely fast as it's written in Rust.

[https://github.com/swc-project/swc](https://github.com/swc-project/swc)

## Installation

```bash
npm install @node-minify/core @node-minify/swc
```

## Usage

```js
import { minify } from '@node-minify/core';
import { swc } from '@node-minify/swc';

const result = await minify({
  compressor: swc,
  input: 'foo.js',
  output: 'bar.js'
});
```

## Options

```js
const result = await minify({
  compressor: swc,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    compress: {
      drop_console: true
    },
    mangle: true
  }
});
```

[Check all options](https://swc.rs/docs/configuration/minification)
