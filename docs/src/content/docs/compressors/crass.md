---
title: "crass (Deprecated)"
description: "crass for node-minify - DEPRECATED"
---

:::danger[Deprecated]
**This package is deprecated.** `crass` is no longer maintained (last update ~2018).

Please migrate to [`cssnano`](/compressors/cssnano) or [`clean-css`](/compressors/clean-css) instead.
:::

`crass` can compress only CSS files.

[https://github.com/mattbasta/crass](https://github.com/mattbasta/crass)

## Installation

```bash
npm install @node-minify/core @node-minify/crass
```

## Usage

```js
import { minify } from '@node-minify/core';
import { crass } from '@node-minify/crass';

const result = await minify({
  compressor: crass,
  input: 'foo.css',
  output: 'bar.css'
});
```

[Check all options](https://github.com/mattbasta/crass)
