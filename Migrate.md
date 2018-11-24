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
