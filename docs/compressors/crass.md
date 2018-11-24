# crass

`crass` can compress only CSS files.

[https://github.com/mattbasta/crass](https://github.com/mattbasta/crass)

## Usage

```js
const minify = require('@node-minify/core');
const crass = require('@node-minify/crass');

minify({
  compressor: crass,
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```
