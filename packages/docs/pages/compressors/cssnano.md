# cssnano

`cssnano` can compress only CSS files.

[https://github.com/cssnano/cssnano](https://github.com/cssnano/cssnano)

## Usage

```js
const minify = require('@node-minify/core');
const cssnano = require('@node-minify/cssnano');

minify({
  compressor: cssnano,
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```
