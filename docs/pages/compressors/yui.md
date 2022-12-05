# YUI Compressor

`Yahoo Compressor` can compress both JavaScript and CSS files.

[http://yui.github.io/yuicompressor/](http://yui.github.io/yuicompressor/)

## Usage for JavaScript

```js
const minify = require('@node-minify/core');
const yui = require('@node-minify/yui');

minify({
  compressor: yui,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Usage for CSS

```js
minify({
  compressor: yui,
  type: 'css',
  input: 'foo.css',
  output: 'bar.css',
  callback: function(err, min) {}
});
```

## Java

::: warning
It assumes that you have Java installed on your environment.
:::

To check, run:

```bash
java -version
```

How to install:

Mac: [https://java.com/en/download/help/mac_install.xml](https://java.com/en/download/help/mac_install.xml)

Windows: [https://java.com/en/download/help/windows_manual_download.xml](https://java.com/en/download/help/windows_manual_download.xml)

Linux: [https://www.java.com/en/download/help/linux_x64_install.xml](https://www.java.com/en/download/help/linux_x64_install.xml)

## Options

```js
minify({
  compressor: yui,
  type: 'js',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    'line-break': 80,
    charset: 'utf8'
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[Check all options](http://yui.github.io/yuicompressor)
