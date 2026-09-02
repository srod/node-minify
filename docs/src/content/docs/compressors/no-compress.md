---
title: "no-compress"
description: "no-compress for node-minify"
---

**Status:** Legacy

`no-compress` passes content through unchanged. It performs no minification.

Use it to concatenate files without compressing them, or as a placeholder while wiring up a build.

## Installation

```bash
npm install @node-minify/core @node-minify/no-compress
```

## Usage

Concatenate several files into one, leaving the contents untouched:

```js
import { minify } from '@node-minify/core';
import { noCompress } from '@node-minify/no-compress';

const result = await minify({
  compressor: noCompress,
  input: ['foo.js', 'foo2.js', 'foo3.js'],
  output: 'bar.js'
});
```

## In Memory

```js
import { minify } from '@node-minify/core';
import { noCompress } from '@node-minify/no-compress';

const result = await minify({
  compressor: noCompress,
  content: 'var foo = 1;'
});
```

## Options

`no-compress` takes no options. Content is returned exactly as provided; a `Buffer` input is converted to a string.
