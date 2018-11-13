# html-minifier

`html-minifier` can compress only HTML files.

[https://github.com/kangax/html-minifier](https://github.com/kangax/html-minifier)

## Usage

```js
const compressor = require('@node-minify/core');
const htmlMinifier = require('@node-minify/html-minifier');

compressor.minify({
  compressor: htmlMinifier,
  input: 'foo.html',
  output: 'bar.html',
  callback: function(err, min) {}
});
```

## Options

```js
compressor.minify({
  compressor: htmlMinifier,
  input: 'foo.html',
  output: 'bar.html',
  options: {
    removeAttributeQuotes: true
  },
  callback: function(err, min) {}
});
```

[Check all options](https://github.com/kangax/html-minifier)
