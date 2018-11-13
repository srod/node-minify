# crass

`crass` can compress only CSS files.

[https://github.com/mattbasta/crass](https://github.com/mattbasta/crass)

## Usage

```js
const compressor = require('@node-minify/core');
const crass = require('@node-minify/crass');

compressor.minify({
  compressor: crass,
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```
