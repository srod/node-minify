---
title: "imagemin"
description: "imagemin for node-minify"
---

`imagemin` compresses PNG, JPEG, and GIF images using [imagemin](https://github.com/imagemin/imagemin) and its plugins.

> **Note**: For new projects, consider using `@node-minify/sharp` which is more actively maintained and offers better performance.

## Installation

```bash
npm install @node-minify/core @node-minify/imagemin
```

## Usage

```js
import { readFileSync } from 'node:fs';
import { minify } from '@node-minify/core';
import { imagemin } from '@node-minify/imagemin';

const result = await minify({
  compressor: imagemin,
  content: readFileSync('photo.jpg'),
  options: {
    quality: 80
  }
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `quality` | `number` | `80` | Quality setting for JPEG (0-100) |
| `lossless` | `boolean` | `false` | Use lossless compression for PNG |
| `effort` | `number` | `6` | Compression effort for pngquant (1-10) |
| `optimizationLevel` | `number` | `1` | Optimization level for gifsicle (1-3) |

## Included Plugins

- **imagemin-mozjpeg**: JPEG compression
- **imagemin-pngquant**: PNG compression
- **imagemin-gifsicle**: GIF compression

[Check all options](https://github.com/imagemin/imagemin)
