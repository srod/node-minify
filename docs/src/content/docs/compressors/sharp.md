---
title: "sharp"
description: "sharp for node-minify"
---

`sharp` converts and compresses images to WebP, AVIF, PNG, and JPEG formats using the high-performance [sharp](https://sharp.pixelplumbing.com/) library.

## Installation

```bash
npm install @node-minify/core @node-minify/sharp
```

## Usage

```js
import { readFileSync } from 'node:fs';
import { minify } from '@node-minify/core';
import { sharp } from '@node-minify/sharp';

// Convert PNG to WebP
const result = await minify({
  compressor: sharp,
  content: readFileSync('image.png'),
  options: {
    format: 'webp',
    quality: 80
  }
});
```

## Multi-format Output

Convert to multiple formats simultaneously:

```js
const result = await minify({
  compressor: sharp,
  content: readFileSync('image.png'),
  options: {
    formats: ['webp', 'avif'],
    quality: 80
  }
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `'webp' \| 'avif' \| 'png' \| 'jpeg'` | `'webp'` | Output format for single conversion |
| `formats` | `Array<'webp' \| 'avif'>` | - | Multiple output formats |
| `quality` | `number` | `80` | Quality setting (1-100) |
| `lossless` | `boolean` | `false` | Use lossless compression |
| `effort` | `number` | `6` | Compression effort (0-10) |

[Check all options](https://sharp.pixelplumbing.com/api-output)
