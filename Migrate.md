# Node-minify migration from `1.x.x` to `2.x.x`

## Config changes

- No need to instantiate anymore

```new compressor.minify()``` to ```compressor.minify()```

- type was renamed to compressor

```{ type: 'gcc' }``` to ```{ compressor: 'gcc' }```

- fileIn was renamed to input

```{ fileIn: 'foo.js' }``` to ```{ input: 'foo.js' }```

- fileOut was renamed to output

```{ fileOut: 'bar.js' }``` to ```{ output: 'bar.js' }```

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
