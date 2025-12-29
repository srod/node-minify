<p align="center"><img src="/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/imagemin"><img src="https://img.shields.io/npm/v/@node-minify/imagemin.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/imagemin"><img src="https://img.shields.io/npm/dm/@node-minify/imagemin.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg"></a>
</p>

# imagemin

`imagemin` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allows you to compress PNG, JPEG, and GIF images using [imagemin](https://github.com/imagemin/imagemin) and its plugins (mozjpeg, pngquant, gifsicle).

> **Note**: For new projects, consider using `@node-minify/sharp` which is more actively maintained and offers better performance.

## Installation

```bash
npm install @node-minify/core @node-minify/imagemin
```

## Usage

```js
import { minify } from '@node-minify/core';
import { imagemin } from '@node-minify/imagemin';

// Compress image
await minify({
  compressor: imagemin,
  input: 'photo.jpg',
  output: 'photo.min.jpg',
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

## Documentation

Visit https://node-minify.2clics.net for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
