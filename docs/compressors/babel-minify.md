# babel-minify

`babel-minify` can compress only JavaScript files.

[https://github.com/babel/minify](https://github.com/babel/minify)

## Usage

```js
const minify = require('@node-minify/core');
const babelMinify = require('@node-minify/babel-minify');

minify({
  compressor: babelMinify,
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Options

```js
minify({
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
