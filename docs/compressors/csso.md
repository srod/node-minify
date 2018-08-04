# CSSO

`CSSO` can compress only CSS files.

[https://github.com/css/csso](https://github.com/css/csso)

## Usage

```js
compressor.minify({
  compressor: 'csso',
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```
