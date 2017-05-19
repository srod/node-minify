/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var mkdirp = require('mkdirp');
var utils = require('../lib/utils');
var babili = require('./compressors/babili');
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
  'babili': babili,
  'butternut': butternut,
  'yui': function(settings, data) {
    return yui('css', settings, data);
  },
  'yui-css': function(settings, data) {
    return yui('css', settings, data);
  },
  'yui-js': function(settings, data) {
    return yui('js', settings, data);
  },
  'gcc': gcc,
  'gcc-java': function(settings, data) {
    return gccJava(settings, data, false);
  },
  'gcc-legacy': function(settings, data) {
    return gccJava(settings, data, true);
  },
  'uglifyjs': uglifyjs,
  'sqwish': sqwish,
  'clean-css': cleanCSS,
  'csso': csso,
  'no-compress': noCompress
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
  return compressorsMap[settings.compressor](settings, content);
}

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} input
 * @return {Object}
 */

function getContentFromFiles(input) {
  if (!Array.isArray(input)) {
    return fs.readFileSync(input, 'utf8');
  }

  return input.map(function(path) {
    return fs.readFileSync(path, 'utf8');
  }).join('\n');
}

/**
 * Create folder of the target file.
 *
 * @param {String} file - Full path of the file
 */

function createDirectory(file) {
  mkdirp.sync(file.substr(0, file.lastIndexOf('/')));
}
