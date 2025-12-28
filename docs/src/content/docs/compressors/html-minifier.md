---
title: "html-minifier"
description: "html-minifier for node-minify"
---

`html-minifier` can compress only HTML files.

[https://github.com/terser/html-minifier-terser](https://github.com/terser/html-minifier-terser)

:::note
In v10, `html-minifier` was replaced with `html-minifier-terser` for security reasons. The API remains the same.
:::

## Installation

```bash
npm install @node-minify/core @node-minify/html-minifier
```

## Usage

```js
import { minify } from '@node-minify/core';
import { htmlMinifier } from '@node-minify/html-minifier';

const result = await minify({
  compressor: htmlMinifier,
  input: 'foo.html',
  output: 'bar.html'
});
```

## In Memory

```js
import { minify } from '@node-minify/core';
import { htmlMinifier } from '@node-minify/html-minifier';

const html = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>`;

const result = await minify({
  compressor: htmlMinifier,
  content: html
});
```

## Options

```js
const result = await minify({
  compressor: htmlMinifier,
  input: 'foo.html',
  output: 'bar.html',
  options: {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true
  }
});
```

[Check all options](https://github.com/terser/html-minifier-terser#options-quick-reference)
