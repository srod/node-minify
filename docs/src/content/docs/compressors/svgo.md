---
title: "svgo"
description: "svgo for node-minify"
---

`svgo` optimizes SVG files using [SVGO](https://github.com/svg/svgo).

## Installation

```bash
npm install @node-minify/core @node-minify/svgo
```

## Usage

```js
import { minify } from '@node-minify/core';
import { svgo } from '@node-minify/svgo';

const result = await minify({
  compressor: svgo,
  input: 'icon.svg',
  output: 'icon.min.svg'
});
```

## In-memory

```js
const result = await minify({
  compressor: svgo,
  content: '<svg xmlns="http://www.w3.org/2000/svg">...</svg>'
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multipass` | `boolean` | `true` | Run optimizations multiple times |
| `plugins` | `PluginConfig[]` | `['preset-default']` | SVGO plugins to use |
| `floatPrecision` | `number` | - | Decimal places for numbers |
| `js2svg.pretty` | `boolean` | `false` | Pretty print output |
| `js2svg.indent` | `number` | `0` | Indentation spaces |

[Check all options](https://github.com/svg/svgo#configuration)
