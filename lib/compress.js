/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var mkdirp = require('mkdirp');
var cleanCSS = require('./compressors/clean-css');
var csso = require('./compressors/csso');
var gcc = require('./compressors/gcc');
var noCompress = require('./compressors/no-compress');
var sqwish = require('./compressors/sqwish');
var uglifyjs = require('./compressors/uglifyjs');
var yui = require('./compressors/yui');

/**
 * Mapping input compressors to functions
 * to be executed
 */

var compressorsMap = {
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
  if (typeof compressorsMap[settings.type] !== 'function') {
    throw new Error('Type "' + settings.type + '" does not exist');
  }

  createDirectory(settings.fileOut);
  var data = getDataFromFiles(settings.fileIn);
  return compressorsMap[settings.type](settings, data);
}

/**
 * Concatenate all input files and get the data.
 *
 * @param {String|Array} fileIn
 * @return {Object}
 */

function getDataFromFiles(fileIn) {
  if (!Array.isArray(fileIn)) {
    return fs.readFileSync(fileIn, 'utf8');
  }

  return fileIn.map(function(path) {
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
