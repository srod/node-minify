---
title: "clean-css"
description: "clean-css for node-minify"
---

`clean-css` can compress only CSS files.

[https://github.com/GoalSmashers/clean-css](https://github.com/GoalSmashers/clean-css)

## Usage

```js
const minify = require('@node-minify/core');
const cleanCSS = require('@node-minify/clean-css');

minify({
  compressor: cleanCSS,
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

## Options

```js
minify({
  compressor: cleanCSS,
  input: 'foo.css',
  output: 'bar.css',
  options: {
    advanced: false, // set to false to disable advanced optimizations - selector & property merging, reduction, etc.
    aggressiveMerging: false // set to false to disable aggressive merging of properties.
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[Check all options](https://github.com/jakubpawlowicz/clean-css/tree/3.4)
