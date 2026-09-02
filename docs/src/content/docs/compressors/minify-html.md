---
title: "minify-html"
description: "minify-html for node-minify"
---

**Status:** Recommended

`minify-html` can compress only HTML files.

[https://github.com/wilsonzlin/minify-html](https://github.com/wilsonzlin/minify-html)

A Rust-based HTML minifier with Node.js bindings. It uses lightningcss for CSS minification and oxc for JavaScript minification.

## Installation

```bash
npm install @node-minify/core @node-minify/minify-html
```

## Usage

```js
import { minify } from '@node-minify/core';
import { minifyHtml } from '@node-minify/minify-html';

const result = await minify({
  compressor: minifyHtml,
  input: 'foo.html',
  output: 'bar.html'
});
```

## In Memory

```js
import { minify } from '@node-minify/core';
import { minifyHtml } from '@node-minify/minify-html';

const html = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>`;

const result = await minify({
  compressor: minifyHtml,
  content: html
});
```

## Options

CSS minification is enabled by default. JavaScript minification is disabled by default, because the underlying minifier can panic on some JavaScript patterns; enable it explicitly if you need it.

```js
const result = await minify({
  compressor: minifyHtml,
  input: 'foo.html',
  output: 'bar.html',
  options: {
    minify_css: true,
    minify_js: true,
    keep_comments: false
  }
});
```

[Check all options](https://github.com/wilsonzlin/minify-html#minification)
