---
title: "esbuild"
description: "esbuild for node-minify"
---

`esbuild` can compress both JavaScript and CSS files. It's extremely fast as it's written in Go.

[https://github.com/evanw/esbuild](https://github.com/evanw/esbuild)

## Installation

```bash
npm install @node-minify/core @node-minify/esbuild
```

## Usage for JavaScript

```js
import { minify } from '@node-minify/core';
import { esbuild } from '@node-minify/esbuild';

const result = await minify({
  compressor: esbuild,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js'
});
```

## Usage for CSS

```js
import { minify } from '@node-minify/core';
import { esbuild } from '@node-minify/esbuild';

const result = await minify({
  compressor: esbuild,
  type: 'css',
  input: 'foo.css',
  output: 'bar.css'
});
```

## Options

```js
const result = await minify({
  compressor: esbuild,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    target: 'es2020',
    minifyWhitespace: true,
    minifyIdentifiers: true,
    minifySyntax: true
  }
});
```

[Check all options](https://esbuild.github.io/api/#transform)
