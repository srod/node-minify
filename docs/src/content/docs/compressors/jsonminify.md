---
title: "jsonminify"
description: "jsonminify for node-minify"
---

`jsonminify` can compress only JSON files.

[https://github.com/fkei/JSON.minify](https://github.com/fkei/JSON.minify)

## Installation

```bash
npm install @node-minify/core @node-minify/jsonminify
```

## Usage

```js
import { minify } from '@node-minify/core';
import { jsonminify } from '@node-minify/jsonminify';

const result = await minify({
  compressor: jsonminify,
  input: 'foo.json',
  output: 'bar.json'
});
```

## In Memory

```js
import { minify } from '@node-minify/core';
import { jsonminify } from '@node-minify/jsonminify';

const json = `
{
  "name": "test",
  "version": "1.0.0"
}`;

const result = await minify({
  compressor: jsonminify,
  content: json
});
```

[Check all options](https://github.com/fkei/JSON.minify)
