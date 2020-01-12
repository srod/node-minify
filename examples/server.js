const minify = require('@node-minify/core');
const yui = require('@node-minify/yui');
const terser = require('@node-minify/terser');
const htmlMinifier = require('@node-minify/html-minifier');
const babelMinify = require('@node-minify/babel-minify');
const gcc = require('@node-minify/google-closure-compiler');
const uglifyjs = require('@node-minify/uglify-js');
const noCompress = require('@node-minify/no-compress');
const sqwish = require('@node-minify/sqwish');
const crass = require('@node-minify/crass');
const cssnano = require('@node-minify/cssnano');
const cleanCSS = require('@node-minify/clean-css');
const jsonminify = require('@node-minify/jsonminify');

console.log('sync 1');
minify({
  compressor: yui,
  input: ['public/js/sample.js', 'public/js/sample2.js'],
  output: 'public/js-dist/yui-publicfolder-concat.js',
  type: 'js',
  sync: true,
  callback: function(err, value) {
    console.log('sync 2', value);
  }
});
console.log('sync 3');

minify({
  compressor: terser,
  input: ['public/js/sample.js', 'public/js/sample2.js'],
  output: 'public/js-dist/terser-concat.js'
}).then(function(min) {
  console.log('terser min');
  console.log(min);
});

const html = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>
`;

minify({
  compressor: htmlMinifier,
  content: html,
  options: {
    minifyJS: false
  },
  callback: function(err, min) {
    console.log('callback min');
    console.log(min);
  }
}).then(function(min) {
  console.log('html min');
  console.log(min);
});

minify({
  compressor: htmlMinifier,
  publicFolder: 'public/html/',
  input: '**/*.html',
  output: '$1.min.html',
  replaceInPlace: true,
  callback: function(err, _min) {
    if (err) console.log(err);
    console.log(_min);
  }
});

minify({
  compressor: htmlMinifier,
  input: 'public/index.html',
  output: 'public/html-dist/index.min.html',
  options: {
    minifyJS: false
  }
}).then(function(min) {
  console.log('html min');
  console.log(min);
});

minify({
  compressor: htmlMinifier,
  publicFolder: 'public/html/',
  input: '*.html',
  output: 'public/html-dist/html.min.html',
  options: {
    minifyJS: false
  }
}).then(function(min) {
  console.log('html min');
  console.log(min);
});

minify({
  compressor: htmlMinifier,
  publicFolder: 'public/html/',
  input: '*.html',
  output: '$1.min.html',
  options: {
    minifyJS: false
  }
}).then(function(min) {
  console.log('html min');
  console.log(min);
});

const json = `
[
  {
    "item1": "item1"
  },
    {
    "item2": "item2"
  }
]
`;

minify({
  compressor: jsonminify,
  content: json,
  callback: function(err, min) {
    console.log('callback min');
    console.log(min);
  }
}).then(function(min) {
  console.log('json min');
  console.log(min);
});

minify({
  compressor: babelMinify,
  input: 'public/js-es6/**/*.js',
  output: 'public/js-dist/babel-minify-$1.js'
}).then(function(min) {
  //console.log(min);
});

minify({
  compressor: babelMinify,
  input: 'public/js-es6/**/*.js',
  output: 'public/js-dist/babel-minify-es6.js'
}).then(function(min) {
  //console.log(min);
});

minify({
  compressor: gcc,
  input: 'public/js/**/*.js',
  output: 'public/js-dist/gcc-wildcards.js',
  sync: true,
  callback: function(err, min) {
    console.log('wildcards GCC');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: yui,
  input: 'public/js/**/*.js',
  output: 'public/js-dist/yui-wildcards.js',
  type: 'js',
  callback: function(err, min) {
    console.log('wildcards YUI JS');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: uglifyjs,
  input: 'public/js/**/*.js',
  output: 'public/js-dist/uglifyjs-wildcards.js',
  callback: function(err, min) {
    console.log('wildcards Uglifyjs');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: noCompress,
  input: 'public/js/**/*.js',
  output: 'public/js-dist/no-compress-wildcards.js',
  callback: function(err, min) {
    console.log('wildcards no-compress');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: gcc,
  input: 'public/js/sample.js',
  output: 'public/js-dist/gcc-onefile.js',
  callback: function(err, min) {
    console.log('GCC one file');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: gcc,
  input: ['public/js/sample.js', 'public/js/sample2.js'],
  output: 'public/js-dist/gcc-concat.js',
  callback: function(err, min) {
    console.log('GCC concat multi files');
    console.log(err);
    //console.log(min);
  }
});

// Using YUI Compressor
minify({
  compressor: yui,
  input: 'public/css/sample.css',
  output: 'public/css-dist/yui-onefile.css',
  type: 'css',
  callback: function(err, min) {
    console.log('YUI CSS one file');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: yui,
  input: 'public/js/sample.js',
  output: 'public/js-dist/yui-onefile.js',
  type: 'js',
  callback: function(err, min) {
    console.log('YUI JS one file');
    console.log(err);
    //console.log(min);
  }
});

// Using UglifyJS
minify({
  compressor: uglifyjs,
  input: 'public/js/sample.js',
  output: 'public/js-dist/uglify-onefile.js',
  callback: function(err, min) {
    console.log('Uglifyjs one file');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: uglifyjs,
  input: ['public/js/sample.js', 'public/js/sample2.js'],
  output: 'public/js-dist/uglify-concat.js',
  callback: function(err, min) {
    console.log('Uglifyjs concat multi files');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: noCompress,
  input: ['public/js/sample.js', 'public/js/sample2.js'],
  output: 'public/js-dist/no-compress-concat.js',
  callback: function(err, min) {
    console.log('No compress concat');
    console.log(err);
    //console.log(min);
  }
});

// Using Sqwish
minify({
  compressor: sqwish,
  input: ['public/css/sample.css', 'public/css/sample2.css'],
  output: 'public/css-dist/sqwish-concat.css',
  callback: function(err, min) {
    console.log('Sqwish concat');
    console.log(err);
    //console.log(min);
  }
});

// Using Crass
minify({
  compressor: crass,
  input: ['public/css/sample.css', 'public/css/sample2.css'],
  output: 'public/css-dist/crass-concat.css',
  callback: function(err, min) {
    console.log('Crass concat');
    console.log(err);
    //console.log(min);
  }
});

// Using public folder option
minify({
  compressor: yui,
  publicFolder: 'public/js/',
  input: 'sample.js',
  output: 'public/js-dist/yui-publicfolder.js',
  type: 'js',
  callback: function(err, min) {
    console.log('YUI JS with publicFolder option');
    console.log(err);
    //console.log(min);
  }
});

minify({
  compressor: yui,
  publicFolder: 'public/js/',
  input: ['sample.js', 'sample2.js'],
  output: 'public/js-dist/yui-publicfolder-concat.js',
  type: 'js',
  callback: function(err, min) {
    console.log('YUI JS with publicFolder option and array');
    console.log(err);
    //console.log(min);
  }
});

// Using cssnano
minify({
  compressor: cssnano,
  input: ['public/css/sample.css', 'public/css/sample2.css'],
  output: 'public/css-dist/cssnano-concat.css',
  callback: function(err, min) {
    console.log('cssnano concat');
    console.log(err);
    //console.log(min);
  }
});

// Using cleancss
minify({
  compressor: cleanCSS,
  input: ['public/css/sample.css', 'public/css/sample2.css'],
  output: 'public/css-dist/cleancss-concat.css',
  callback: function(err, min) {
    console.log('cleancss concat');
    console.log(err);
    //console.log(min);
  },
  options: {
    sourceMap: {
      filename: `public/css-dist/cleancss-concat.map`,
      url: `public/css-dist/cleancss-concat.map`
    }
  }
});
