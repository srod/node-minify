# Options

## Concatenate Files

In order to concatenate files, simply pass in an array with the compressor `no-compress`.

```js
const minify = require('@node-minify/core');
const noCompress = require('@node-minify/no-compress');

minify({
  compressor: 'noCompress',
  input: ['foo.js', 'foo2.js', 'foo3.js'],
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Using wildcards

```js
const minify = require('@node-minify/core');
const gcc = require('@node-minify/google-closure-compiler');

minify({
  compressor: gcc,
  input: 'public/**/*.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Using wildcards with $1 output

This option will not merge the files.

```js
const minify = require('@node-minify/core');
const babelMinify = require('@node-minify/babel-minify');

minify({
  compressor: babelMinify,
  input: 'public/**/*.js',
  output: '$1.min.js',
  callback: function(err, min) {}
});
```

If you have 3 files `file1.js`, `file2.js` and `file3.js`; those files will be outputed as `file1.min.js`, `file2.min.js` and `file3.min.js`

## Using sync option

```js
const minify = require('@node-minify/core');
const yui = require('@node-minify/yui');

minify({
  compressor: yui,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js',
  sync: true,
  callback: function(err, min) {}
});
```

## Using public folder

`publicFolder` allow you to specify an input and output folder.

It avoids you to specify the folder for each file.

```js
const minify = require('@node-minify/core');
const gcc = require('@node-minify/google-closure-compiler');

minify({
  compressor: gcc,
  publicFolder: './public/',
  input: ['foo.js', 'foo2.js'],
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Max Buffer Size (only for Java)

In some cases you might need a bigger max buffer size (for example when minifying really large files).
By default the buffer is `1000 * 1024` which should be enough. If you however need more buffer, you can simply pass in the desired buffer size as an argument to `minify` like so:

```js
const minify = require('@node-minify/core');
const gcc = require('@node-minify/google-closure-compiler');

minify({
  compressor: gcc,
  input: 'foo.js',
  output: 'bar.js',
  sync: true,
  buffer: 1000 * 1024,
  callback: function(err, min) {}
});
```
