---
title: "sharp"
description: "sharp for node-minify"
---

**Status:** Recommended

`sharp` converts and compresses images to WebP, AVIF, PNG, JPEG, and GIF formats using the high-performance [sharp](https://sharp.pixelplumbing.com/) library.

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
| `format` | `'webp' \| 'avif' \| 'png' \| 'jpeg' \| 'gif'` | `'webp'` | Output format for single conversion |
| `formats` | `Array<'webp' \| 'avif' \| 'png' \| 'jpeg' \| 'gif'>` | - | Multiple output formats |
| `quality` | `number` | `80` | Quality setting (1-100) |
| `lossless` | `boolean` | `false` | Use lossless compression |
| `effort` | `number` | `4` (`6` for PNG, `7` for GIF) | CPU effort/compression level (0-9 for AVIF/PNG, 0-6 for WebP, 1-10 for GIF) |

## GIF Output

Set `format: 'gif'` (or include `'gif'` in `formats`) to write a GIF:

```js
await minify({
  compressor: sharp,
  input: 'image.png',
  output: 'image.gif',
  options: { format: 'gif' }
});
```

- sharp **re-encodes** the image with libvips instead of optimizing the GIF losslessly like [gifsicle](/compressors/imagemin) does. The output can be larger or smaller than the input, and colors are quantized to a 256-color palette.
- Animated GIFs keep all their frames. For every other output format only the first frame is read.
- Only `effort` applies to GIF. `quality` and `lossless` are ignored.
- This is the replacement for imagemin's GIF support, which is removed in v12.

[Check all options](https://sharp.pixelplumbing.com/api-output)
