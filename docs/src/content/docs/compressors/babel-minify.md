---
title: "babel-minify"
description: "babel-minify for node-minify"
---

`babel-minify` can compress only JavaScript files.

[https://github.com/babel/minify](https://github.com/babel/minify)

## Installation

```bash
npm install @node-minify/core @node-minify/babel-minify
```

## Usage

```js
import { minify } from '@node-minify/core';
import { babelMinify } from '@node-minify/babel-minify';

const result = await minify({
  compressor: babelMinify,
  input: 'foo.js',
  output: 'bar.js'
});
```

## Options

```js
const result = await minify({
  compressor: babelMinify,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    babelrc: 'public/.babelrc',
    presets: ['env']
  }
});
```

[Check all options](https://github.com/babel/minify)
