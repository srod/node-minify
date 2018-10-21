/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var mkdirp = require('mkdirp');
var utils = require('../lib/utils');
var babelMinify = require('./compressors/babel-minify');
var butternut = require('./compressors/butternut');
var cleanCSS = require('./compressors/clean-css');
var csso = require('./compressors/csso');
var gcc;
var gccJava = require('./compressors/gcc-java');
var HTMLMinifier = require('./compressors/html-minifier');
var noCompress = require('./compressors/no-compress');
var sqwish = require('./compressors/sqwish');
var uglifyjs = require('./compressors/uglifyjs');
var uglifyES = require('./compressors/uglify-es');
var terser = require('./compressors/terser');
var yui = require('./compressors/yui');
var crass = require('./compressors/crass');

if ((process.execArgv && process.execArgv.indexOf('--use_strict') > -1) || !utils.isNodeV4AndHigher()) {
  gcc = require('./compressors/gcc-java');
} else {
  gcc = require('./compressors/gcc');
}

/**
 * Mapping input compressors to functions
 * to be executed
 */

var compressorsMap = {
  'babel-minify': babelMinify,
  butternut: butternut,
  yui: function(settings, data, callback, index) {
    return yui('css', settings, data, callback, index);
  },
  'yui-css': function(settings, data, callback, index) {
    return yui('css', settings, data, callback, index);
  },
  'yui-js': function(settings, data, callback, index) {
    return yui('js', settings, data, callback, index);
  },
  gcc: gcc,
  'gcc-java': function(settings, data, callback, index) {
    return gccJava(settings, data, callback, false, index);
  },
  'gcc-legacy': function(settings, data, callback, index) {
    return gccJava(settings, data, callback, true, index);
  },
  'html-minifier': HTMLMinifier,
  terser: terser,
  uglifyjs: uglifyjs,
  'uglify-es': uglifyES,
  sqwish: sqwish,
  'clean-css': cleanCSS,
  csso: csso,
  'no-compress': noCompress,
  /**
   * @deprecated since version 2.4.0 - babili was renamed to babel-minify
   */
  babili: babelMinify,
  crass: crass
};

/**
 * Expose `compress()`.
 */

module.exports = compress;

/**
 * Run compressor.
 *
 * @param {Object} settings
 */

function compress(settings) {
  if (typeof compressorsMap[settings.compressor] !== 'function') {
    throw new Error('Type "' + settings.compressor + '" does not exist');
  }

  createDirectory(settings.output);

  if (Array.isArray(settings.output)) {
    return settings.sync ? compressArrayOfFilesSync(settings) : compressArrayOfFilesAsync(settings);
  } else {
    return compressSingleFile(settings);
  }
}

/**
 * Compress an array of files in sync.
 *
 * @param {Object} settings
 */

function compressArrayOfFilesSync(settings) {
  return settings.input.forEach(function(input, index) {
    var content = getContentFromFiles(input);
    return runSync(settings, content, index);
  });
}

/**
 * Compress an array of files in async.
 *
 * @param {Object} settings
 */

function compressArrayOfFilesAsync(settings) {
  var sequence = Promise.resolve();
  settings.input.forEach(function(input, index) {
    var content = getContentFromFiles(input);
    sequence = sequence.then(function() {
      return runAsync(settings, content, index);
    });
  });
  return sequence;
}

/**
 * Compress a single file.
 *
 * @param {Object} settings
 */

function compressSingleFile(settings) {
  var content = getContentFromFiles(settings.input);
  return settings.sync ? runSync(settings, content) : runAsync(settings, content);
}

/**
 * Run compressor in sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {String}
 */

function runSync(settings, content, index) {
  return compressorsMap[settings.compressor](settings, content, null, index);
}

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Number} index - index of the file being processed
 * @return {Promise}
 */

function runAsync(settings, content, index) {
  return new Promise(function(resolve, reject) {
    compressorsMap[settings.compressor](
      settings,
      content,
      function(err, min) {
        if (err) {
          return reject(err);
        }
        resolve(min);
      },
      index
    );
  });
}

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} input
 * @return {String}
 */

function getContentFromFiles(input) {
  if (!Array.isArray(input)) {
    return fs.readFileSync(input, 'utf8');
  }

  return input
    .map(function(path) {
      return fs.readFileSync(path, 'utf8');
    })
    .join('\n');
}

/**
 * Create folder of the target file.
 *
 * @param {String} file - Full path of the file
 */

function createDirectory(file) {
  if (Array.isArray(file)) {
    file = file[0];
  }

  mkdirp.sync(file.substr(0, file.lastIndexOf('/')));
}
