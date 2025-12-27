# Node-minify migration from `9.x.x` to `10.x.x`

## Breaking Changes Overview

| Change | Before (v9) | After (v10) |
|--------|-------------|-------------|
| Module system | CommonJS + ESM | **ESM only** |
| Async pattern | Callbacks + Promises | **Async/Await only** |
| Exports | Default exports | **Named exports** |
| Node.js | Node 18+ | **Node 20+** (Node 22 recommended) |

---

## 1. ESM Only (No More CommonJS)

Node-minify v10 is ESM-only. Update your `package.json` and imports.

### package.json

```json
{
  "type": "module"
}
```

### Import syntax

```js
// ❌ Before (CommonJS)
const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');

// ✅ After (ESM)
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';
```

---

## 2. Named Exports (No More Default Exports)

All packages now use named exports.

```js
// ❌ Before
import minify from '@node-minify/core';
import terser from '@node-minify/terser';

// ✅ After
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';
```

### All compressor imports

```js
import { minify } from '@node-minify/core';

// JavaScript compressors
import { babelMinify } from '@node-minify/babel-minify';
import { gcc } from '@node-minify/google-closure-compiler';
import { terser } from '@node-minify/terser';
import { uglifyJs } from '@node-minify/uglify-js';
import { uglifyEs } from '@node-minify/uglify-es';

// CSS compressors
import { cleanCss } from '@node-minify/clean-css';
import { crass } from '@node-minify/crass';
import { cssnano } from '@node-minify/cssnano';
import { csso } from '@node-minify/csso';
import { sqwish } from '@node-minify/sqwish';

// HTML compressor
import { htmlMinifier } from '@node-minify/html-minifier';

// Other
import { yui } from '@node-minify/yui';
import { jsonMinify } from '@node-minify/jsonminify';
import { noCompress } from '@node-minify/no-compress';
```

---

## 3. Async/Await Only (No More Callbacks)

Callbacks are removed. Use async/await or promises.

```js
// ❌ Before (callback)
minify({
  compressor: terser,
  input: 'src/*.js',
  output: 'dist/bundle.js',
  callback: function(err, min) {
    if (err) console.error(err);
    console.log(min);
  }
});

// ❌ Before (sync - removed)
const result = minify.sync({
  compressor: terser,
  input: 'src/*.js',
  output: 'dist/bundle.js'
});

// ✅ After (async/await)
const result = await minify({
  compressor: terser,
  input: 'src/*.js',
  output: 'dist/bundle.js'
});

// ✅ After (promise)
minify({
  compressor: terser,
  input: 'src/*.js',
  output: 'dist/bundle.js'
}).then(result => {
  console.log(result);
}).catch(err => {
  console.error(err);
});
```

---

## 4. Node.js Version

- **Minimum**: Node 20
- **Recommended**: Node 22

Update your `.nvmrc` or CI configuration accordingly.

---

## 5. html-minifier Security Update

The `html-minifier` package was replaced with `html-minifier-next` due to security vulnerabilities. No code changes required—the API remains the same.

---

## Complete Migration Example

### Before (v9)

```js
const minify = require('@node-minify/core');
const terser = require('@node-minify/terser');

minify({
  compressor: terser,
  input: 'src/*.js',
  output: 'dist/bundle.js',
  callback: function(err, min) {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Minified:', min);
  }
});
```

### After (v10)

```js
import { minify } from '@node-minify/core';
import { terser } from '@node-minify/terser';

try {
  const result = await minify({
    compressor: terser,
    input: 'src/*.js',
    output: 'dist/bundle.js'
  });
  console.log('Minified:', result);
} catch (err) {
  console.error('Error:', err);
}
```

---

## CLI Changes

The CLI now requires ESM-compatible Node.js. Usage remains the same:

```bash
node-minify --compressor terser --input 'src/*.js' --output dist/bundle.js
```

---

# Node-minify migration from `3.x.x` to `4.x.x`

## Config changes

`node-minify` was splitted into small packages.

- uninstall old version

`npm remove node-minify`

- install the `core` package

`npm install @node-minify/core`

- install the compressor

`npm install @node-minify/uglify-js`

- usage

```js
const minify = require('@node-minify/core');
const uglifyJS = require('@node-minify/uglify-js');

minify({
  compressor: uglifyJS,
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Changes for YUI

`yui-js` and `yui-css` was removed, a type option must be use instead

### Example before

```js
var compressor = require('node-minify');

compressor.minify({
  compressor: 'yui-js',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

```js
var compressor = require('node-minify');

compressor.minify({
  compressor: 'yui-css',
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

### Example after

```js
const minify = require('@node-minify/core');
const yui = require('@node-minify/yui');

minify({
  compressor: yui,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

```js
const minify = require('@node-minify/core');
const yui = require('@node-minify/yui');

minify({
  compressor: yui,
  type: 'css',
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

# Node-minify migration from `1.x.x` to `2.x.x`

## Config changes

- No need to instantiate anymore

`new compressor.minify()` to `compressor.minify()`

- type was renamed to compressor

`{ type: 'gcc' }` to `{ compressor: 'gcc' }`

- fileIn was renamed to input

`{ fileIn: 'foo.js' }` to `{ input: 'foo.js' }`

- fileOut was renamed to output

`{ fileOut: 'bar.js' }` to `{ output: 'bar.js' }`

## Example

### From

```js
var compressor = require('node-minify');

new compressor.minify({
  type: 'gcc',
  fileIn: 'public/js/base.js',
  fileOut: 'public/js-dist/base-min-gcc.js',
  callback: function(err, min) {}
});
```

### To

```js
var compressor = require('node-minify');

compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```
