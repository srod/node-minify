---
title: "clean-css"
description: "clean-css for node-minify"
---

`clean-css` can compress only CSS files.

[https://github.com/clean-css/clean-css](https://github.com/clean-css/clean-css)

## Installation

```bash
npm install @node-minify/core @node-minify/clean-css
```

## Usage

```js
import { minify } from '@node-minify/core';
import { cleanCss } from '@node-minify/clean-css';

const result = await minify({
  compressor: cleanCss,
  input: 'foo.css',
  output: 'bar.css'
});
```

## Options

```js
const result = await minify({
  compressor: cleanCss,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    level: 2,
    sourceMap: true
  }
});
```

[Check all options](https://github.com/clean-css/clean-css#constructor-options)
