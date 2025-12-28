---
title: "GCC"
description: "Google Closure Compiler for node-minify"
---

`Google Closure Compiler` can compress only JavaScript files.

[https://developers.google.com/closure/compiler/](https://developers.google.com/closure/compiler/)

## Installation

```bash
npm install @node-minify/core @node-minify/google-closure-compiler
```

## Usage

```js
import { minify } from '@node-minify/core';
import { gcc } from '@node-minify/google-closure-compiler';

const result = await minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js'
});
```

[https://www.npmjs.com/package/google-closure-compiler](https://www.npmjs.com/package/google-closure-compiler)

## Options

```js
const result = await minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    createSourceMap: true,
    compilationLevel: 'WHITESPACE_ONLY',
    languageIn: 'ECMASCRIPT6'
  }
});
```

[Check all options](https://github.com/google/closure-compiler-npm/tree/master/packages/google-closure-compiler#flags)
