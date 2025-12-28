---
title: "lightningcss"
description: "lightningcss for node-minify"
---

`lightningcss` can compress only CSS files. It's extremely fast as it's written in Rust.

[https://github.com/parcel-bundler/lightningcss](https://github.com/parcel-bundler/lightningcss)

## Installation

```bash
npm install @node-minify/core @node-minify/lightningcss
```

## Usage

```js
import { minify } from '@node-minify/core';
import { lightningCss } from '@node-minify/lightningcss';

const result = await minify({
  compressor: lightningCss,
  input: 'foo.css',
  output: 'bar.css'
});
```

## Options

```js
const result = await minify({
  compressor: lightningCss,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    targets: {
      chrome: 95
    },
    drafts: {
      customMedia: true
    }
  }
});
```

[Check all options](https://lightningcss.dev/docs.html)
