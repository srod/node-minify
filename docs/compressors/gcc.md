# GCC

`Google Closure Compiler` can compress only JavaScript files.

[https://developers.google.com/closure/compiler/](https://developers.google.com/closure/compiler/)

## Usage (JavaScript version)

```js
compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

[https://www.npmjs.com/package/google-closure-compiler-js](https://www.npmjs.com/package/google-closure-compiler-js)

## Usage (Java >= 1.8)

```js
compressor.minify({
  compressor: 'gcc-java',
  input: 'foo.js',
  output: 'bar.js',
  callback: function(err, min) {}
});
```

## Usage (Java <= 1.6)

```js
// Using Google Closure Compiler legacy version for Java 1.6
compressor.minify({
  compressor: 'gcc-legacy',
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

### Options for Google Closure Compiler (JavaScript version)

```js
compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    createSourceMap: true,
    compilationLevel: 'WHITESPACE_ONLY',
    languageIn: 'ECMASCRIPT6'
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[Check all options](https://github.com/google/closure-compiler-js#flags)

### Options for Google Closure Compiler (Java version)

```js
compressor.minify({
  compressor: 'gcc',
  input: 'foo.js',
  output: 'bar.js',
  options: {
    createSourceMap: true,
    compilation_level: 'WHITESPACE_ONLY',
    language: 'ECMASCRIPT6'
    ... // See more information link below
  },
  callback: function (err, min) {}
});
```

[Check all options](https://developers.google.com/closure/compiler/docs/api-ref)
