<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/sharp"><img src="https://img.shields.io/npm/v/@node-minify/sharp.svg" alt="npm version"></a>
  <a href="https://npmjs.org/package/@node-minify/sharp"><img src="https://img.shields.io/npm/dm/@node-minify/sharp.svg" alt="npm downloads"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg" alt="code coverage"></a>
</p>

# sharp

`sharp` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allows you to convert and compress images to WebP, AVIF, PNG, and JPEG formats using the high-performance [sharp](https://sharp.pixelplumbing.com/) library.

## Installation

```bash
npm install @node-minify/core @node-minify/sharp
```

## Usage

```js
import { minify } from '@node-minify/core';
import { sharp } from '@node-minify/sharp';

// Convert to WebP
await minify({
  compressor: sharp,
  input: 'image.png',
  output: 'image.webp',
  options: {
    format: 'webp',
    quality: 80
  }
});

// Convert to multiple formats (WebP + AVIF)
await minify({
  compressor: sharp,
  input: 'image.png',
  output: '$1',  // Auto-generates image.webp and image.avif
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
| `effort` | `number` | `4` | CPU effort/compression level (0-9 for AVIF/PNG, 0-6 for WebP) |

## Documentation

Visit https://node-minify.2clics.net for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
