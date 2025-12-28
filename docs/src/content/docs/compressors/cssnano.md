---
title: "cssnano"
description: "cssnano for node-minify"
---

`cssnano` can compress only CSS files.

[https://github.com/cssnano/cssnano](https://github.com/cssnano/cssnano)

## Installation

```bash
npm install @node-minify/core @node-minify/cssnano
```

## Usage

```js
import { minify } from '@node-minify/core';
import { cssnano } from '@node-minify/cssnano';

const result = await minify({
  compressor: cssnano,
  input: 'foo.css',
  output: 'bar.css'
});
```

## Options

```js
const result = await minify({
  compressor: cssnano,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    preset: 'default'
  }
});
```

[Check all options](https://cssnano.co/docs/config-file)
