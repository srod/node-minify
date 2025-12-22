---
title: "sqwish"
description: "sqwish for node-minify"
---

`sqwish` can compress only CSS files.

[https://github.com/ded/sqwish](https://github.com/ded/sqwish)

## Installation

```bash
npm install @node-minify/core @node-minify/sqwish
```

## Usage

```js
import { minify } from '@node-minify/core';
import { sqwish } from '@node-minify/sqwish';

const result = await minify({
  compressor: sqwish,
  input: 'foo.css',
  output: 'bar.css'
});
```

## Options

```js
const result = await minify({
  compressor: sqwish,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    strict: true
  }
});
```

[Check all options](https://github.com/ded/sqwish)
