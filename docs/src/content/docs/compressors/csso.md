---
title: "CSSO"
description: "CSSO for node-minify"
---

`CSSO` can compress only CSS files.

[https://github.com/css/csso](https://github.com/css/csso)

## Installation

```bash
npm install @node-minify/core @node-minify/csso
```

## Usage

```js
import { minify } from '@node-minify/core';
import { csso } from '@node-minify/csso';

const result = await minify({
  compressor: csso,
  input: 'foo.css',
  output: 'bar.css'
});
```

## Options

```js
const result = await minify({
  compressor: csso,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    restructure: false,
    sourceMap: true
  }
});
```

[Check all options](https://github.com/css/csso#minifysource-options)
