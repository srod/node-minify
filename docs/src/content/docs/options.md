---
title: "Options"
description: "Options for node-minify"
---

`minify()` is asynchronous and returns a promise resolving to the minified content. All examples below use ESM `import`, which is the only module system node-minify supports.

## Concatenate Files

In order to concatenate files, simply pass in an array with the compressor `no-compress`.

```js
import { minify } from '@node-minify/core';
import { noCompress } from '@node-minify/no-compress';

await minify({
  compressor: noCompress,
  input: ['foo.js', 'foo2.js', 'foo3.js'],
  output: 'bar.js'
});
```

## Using wildcards

```js
import { minify } from '@node-minify/core';
import { gcc } from '@node-minify/google-closure-compiler';

await minify({
  compressor: gcc,
  input: 'public/**/*.js',
  output: 'bar.js'
});
```

## Using wildcards with $1 output

This option will not merge the files.

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

await minify({
  compressor: terser,
  input: 'public/**/*.js',
  output: '$1.min.js'
});
```

If you have 3 files `file1.js`, `file2.js` and `file3.js`; those files will be outputed as `file1.min.js`, `file2.min.js` and `file3.min.js`

If you want to save those files in same directory than source, you can use `replaceInPlace` option.

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

await minify({
  compressor: terser,
  input: 'public/**/*.js',
  output: '$1.min.js',
  replaceInPlace: true
});
```

## Using public folder

`publicFolder` allow you to specify an input and output folder.

It avoids you to specify the folder for each file.

```js
import { minify } from '@node-minify/core';
import { gcc } from '@node-minify/google-closure-compiler';

await minify({
  compressor: gcc,
  publicFolder: './public/',
  input: ['foo.js', 'foo2.js'],
  output: 'bar.js'
});
```

## Allowing Empty Output

When minifying files that contain only comments (e.g., license headers in CSS), the minifier may produce empty output. By default, this throws a validation error. Use `allowEmptyOutput` to skip writing the file instead.

```js
import { minify } from '@node-minify/core';
import { cleanCss } from '@node-minify/clean-css';

await minify({
  compressor: cleanCss,
  input: 'styles-with-only-comments.css',
  output: 'styles.min.css',
  allowEmptyOutput: true // Skip writing if result is empty
});
```

When `allowEmptyOutput: true`:
- Empty results are silently skipped (no file written, no error)
- Source maps are also skipped when code is empty
- Returns empty string `""` for in-memory mode
- Original file is preserved when using `replaceInPlace`

## Max Buffer Size

Some compressors spawn a child process. `buffer` caps how much output that process may produce before it is killed. The default is `1000 * 1024` bytes, which is enough for most files; raise it when minifying very large inputs.

```js
import { minify } from '@node-minify/core';
import { gcc } from '@node-minify/google-closure-compiler';

await minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js',
  buffer: 1000 * 1024
});
```

## Timeout

`timeout` limits how long a compressor may run, in milliseconds.

```js
import { minify } from '@node-minify/core';
import { gcc } from '@node-minify/google-closure-compiler';

await minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js',
  timeout: 30000
});
```
