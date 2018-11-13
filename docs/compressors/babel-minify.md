# babel-minify

`babel-minify` can compress only JavaScript files.

[https://github.com/babel/minify](https://github.com/babel/minify)

## Usage

```js
const compressor = require('@node-minify/core');
const babelMinify = require('@node-minify/babel-minify');

compressor.minify({
  compressor: babelMinify,
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Options

```js
compressor.minify({
  compressor: babelMinify,
  input: 'foo.js',
  output: 'bar.js',
  options: {
    babelrc: 'public/.babelrc',
    presets: ['env']
  },
  callback: function(err, min) {}
});
```

[Check all options](https://github.com/babel/minify)
