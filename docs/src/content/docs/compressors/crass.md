---
title: "crass"
description: "crass for node-minify"
---

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
