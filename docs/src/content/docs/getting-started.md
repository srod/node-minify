---
title: 'Getting Started'
description: 'Getting Started for node-minify'
---

## Requirements

- **Node.js**: 20 or higher (Node 22 recommended)
- **Module System**: ESM only (`"type": "module"` in package.json)

## Installation

```bash
npm install @node-minify/core
# Or Yarn
yarn add @node-minify/core
# Or pnpm
pnpm add @node-minify/core
# Or Bun
bun add @node-minify/core
```

And install the compressor you want:

```bash
npm install @node-minify/terser
# Or Yarn
yarn add @node-minify/terser
# Or pnpm
pnpm add @node-minify/terser
# Or Bun
bun add @node-minify/terser
```

## Quick Start

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

// Basic usage with async/await
const result = await minify({
  compressor: terser,
  input: 'src/js/main.js',
  output: 'dist/main.min.js'
});

console.log(result);
```

### Using Wildcards

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

// Concatenate and minify all JS files
const result = await minify({
  compressor: terser,
  input: 'src/**/*.js',
  output: 'dist/bundle.min.js'
});
```

### Using Promises

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

minify({
  compressor: terser,
  input: 'src/**/*.js',
  output: 'dist/bundle.min.js'
}).then((min) => {
  console.log('Minified:', min);
}).catch((err) => {
  console.error('Error:', err);
});
```

### In Memory (No File Output)

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

const min = await minify({
  compressor: htmlMinifier,
  content: html
});

console.log(min);
```

### With Options

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

const result = await minify({
  compressor: terser,
  input: 'src/**/*.js',
  output: 'dist/bundle.min.js',
  options: {
    mangle: true,
    compress: {
      drop_console: true
    }
  }
});
```

## Available Compressors

### JavaScript

```js
import { babelMinify } from '@node-minify/babel-minify';
import { gcc } from '@node-minify/google-closure-compiler';
import { terser } from '@node-minify/terser';
import { uglifyJs } from '@node-minify/uglify-js';
import { uglifyEs } from '@node-minify/uglify-es';
import { yui } from '@node-minify/yui';
```

### CSS

```js
import { cleanCss } from '@node-minify/clean-css';
import { crass } from '@node-minify/crass';
import { cssnano } from '@node-minify/cssnano';
import { csso } from '@node-minify/csso';
import { sqwish } from '@node-minify/sqwish';
import { yui } from '@node-minify/yui'; // with type: 'css'
```

### HTML

```js
import { htmlMinifier } from '@node-minify/html-minifier';
```

### JSON

```js
import { jsonMinify } from '@node-minify/jsonminify';
```

[More examples](https://github.com/srod/node-minify/blob/main/examples/server.js)
