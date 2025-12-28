---
title: "oxc"
description: "oxc for node-minify"
---

`oxc` can compress only JavaScript files. It's extremely fast as it's written in Rust.

[https://github.com/oxc-project/oxc](https://github.com/oxc-project/oxc)

## Installation

```bash
npm install @node-minify/core @node-minify/oxc
```

## Usage

```js
import { minify } from '@node-minify/core';
import { oxc } from '@node-minify/oxc';

const result = await minify({
  compressor: oxc,
  input: 'foo.js',
  output: 'bar.js'
});
```

## Options

```js
const result = await minify({
  compressor: oxc,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    compress: true,
    mangle: true,
    sourceMap: false
  }
});
```

[Check all options](https://oxc.rs/docs/guide/usage/minifier.html)
