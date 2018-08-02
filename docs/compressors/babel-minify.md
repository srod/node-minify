# babel-minify

`babel-minify` can compress only JavaScript files.

[https://github.com/babel/minify](https://github.com/babel/minify)

## Usage

```js
compressor.minify({
  compressor: 'babel-minify',
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

## Options

```js
compressor.minify({
  compressor: 'babel-minify',
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
