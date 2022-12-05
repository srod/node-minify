# uglify-es

`uglify-es` can compress only JavaScript files.

[https://github.com/mishoo/UglifyJS2/tree/harmony](https://github.com/mishoo/UglifyJS2/tree/harmony)

## Usage

```js
const minify = require('@node-minify/core');
const uglifyES = require('@node-minify/uglify-es');

minify({
  compressor: uglifyES,
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Options

```js
minify({
  compressor: uglifyES,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    warnings: true, // pass true to display compressor warnings.
    mangle: false // pass false to skip mangling names.
    output: {} // pass an object if you wish to specify additional output options. The defaults are optimized for best compression.
    compress: false // pass false to skip compressing entirely. Pass an object to specify custom compressor options.
  },
  callback: function (err, min) {}
});
```

[Check all options](https://github.com/mishoo/UglifyJS2/tree/harmony)
