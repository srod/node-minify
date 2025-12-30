<p align="center"><img src="https://raw.githubusercontent.com/srod/node-minify/main/static/node-minify.svg" width="348" alt="node-minify"></p>

<p align="center">A very light minifier Node.js module.</p>

<p align="center">
  <br>
  <a href="https://npmjs.org/package/@node-minify/svgo"><img src="https://img.shields.io/npm/v/@node-minify/svgo.svg"></a>
  <a href="https://npmjs.org/package/@node-minify/svgo"><img src="https://img.shields.io/npm/dm/@node-minify/svgo.svg"></a>
  <a href="https://github.com/srod/node-minify/actions"><img alt="Build Status" src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsrod%2Fnode-minify%2Fbadge%3Fref%3Dmain&style=flat" /></a>
  <a href="https://codecov.io/gh/srod/node-minify"><img src="https://codecov.io/gh/srod/node-minify/branch/main/graph/badge.svg"></a>
</p>

# svgo

`svgo` is a plugin for [`node-minify`](https://github.com/srod/node-minify)

It allows you to optimize SVG files using [SVGO](https://github.com/svg/svgo).

## Installation

```bash
npm install @node-minify/core @node-minify/svgo
```

## Usage

```js
import { minify } from '@node-minify/core';
import { svgo } from '@node-minify/svgo';

// Optimize SVG file
await minify({
  compressor: svgo,
  input: 'icon.svg',
  output: 'icon.min.svg'
});

// In-memory optimization
const optimizedSvg = await minify({
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

## Documentation

Visit https://node-minify.2clics.net for full documentation

## License

[MIT](https://github.com/srod/node-minify/blob/main/LICENSE)
