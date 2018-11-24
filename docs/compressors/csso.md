# CSSO

`CSSO` can compress only CSS files.

[https://github.com/css/csso](https://github.com/css/csso)

## Usage

```js
const minify = require('@node-minify/core');
const csso = require('@node-minify/csso');

minify({
  compressor: csso,
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```
