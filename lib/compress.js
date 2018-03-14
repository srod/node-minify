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
var noCompress = require('./compressors/no-compress');
var sqwish = require('./compressors/sqwish');
var uglifyjs = require('./compressors/uglifyjs');
var yui = require('./compressors/yui');

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
  yui: function(settings, data, callback) {
    return yui('css', settings, data, callback);
  },
  'yui-css': function(settings, data, callback) {
    return yui('css', settings, data, callback);
  },
  'yui-js': function(settings, data, callback) {
    return yui('js', settings, data, callback);
  },
  gcc: gcc,
  'gcc-java': function(settings, data, callback) {
    return gccJava(settings, data, callback, false);
  },
  'gcc-legacy': function(settings, data, callback) {
    return gccJava(settings, data, callback, true);
  },
  uglifyjs: uglifyjs,
  sqwish: sqwish,
  'clean-css': cleanCSS,
  csso: csso,
  'no-compress': noCompress,
  /**
   * @deprecated since version 2.4.0 - babili was renamed to babel-minify
   */
  babili: babelMinify
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
  var content = getContentFromFiles(settings.input);
  return settings.sync ? runSync(settings, content) : runAsync(settings, content);
}

/**
 * Run compressor in sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @return {String}
 */

function runSync(settings, content) {
  return compressorsMap[settings.compressor](settings, content);
}

/**
 * Run compressor in async.
 *
 * @param {Object} settings
 * @param {String} content
 * @return {Promise}
 */

function runAsync(settings, content) {
  return new Promise(function(resolve, reject) {
    compressorsMap[settings.compressor](settings, content, function(err, min) {
      if (err) {
        return reject(err);
      }
      resolve(min);
    });
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
  mkdirp.sync(file.substr(0, file.lastIndexOf('/')));
}
