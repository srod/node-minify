---
title: "YUI Compressor"
description: "Yahoo Compressor for node-minify"
---

`Yahoo Compressor` can compress both JavaScript and CSS files.

[http://yui.github.io/yuicompressor/](http://yui.github.io/yuicompressor/)

:::caution[Java Required]
YUI Compressor requires Java to be installed on your system.

```bash
java -version
```

Install Java:
- [Mac](https://java.com/en/download/help/mac_install.xml)
- [Windows](https://java.com/en/download/help/windows_manual_download.xml)
- [Linux](https://www.java.com/en/download/help/linux_x64_install.xml)
:::

## Installation

```bash
npm install @node-minify/core @node-minify/yui
```

## Usage for JavaScript

```js
import { minify } from '@node-minify/core';
import { yui } from '@node-minify/yui';

const result = await minify({
  compressor: yui,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js'
});
```

## Usage for CSS

```js
import { minify } from '@node-minify/core';
import { yui } from '@node-minify/yui';

const result = await minify({
  compressor: yui,
  type: 'css',
  input: 'foo.css',
  output: 'bar.css'
});
```

## Options

```js
const result = await minify({
  compressor: yui,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    'line-break': 80,
    charset: 'utf8'
  }
});
```

[Check all options](http://yui.github.io/yuicompressor)
