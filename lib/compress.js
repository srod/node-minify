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
var uuid = require('node-uuid');
var Promise = require('bluebird');
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
  'yui': function(settings, data, callbackEnd) {
    yui('css', settings, data, callbackEnd);
  },
  'yui-css': function(settings, data, callbackEnd) {
    yui('css', settings, data, callbackEnd);
  },
  'yui-js': function(settings, data, callbackEnd) {
    yui('js', settings, data, callbackEnd);
  },
  'gcc': function(settings, data, callbackEnd) {
    gcc(settings, data, callbackEnd);
  },
  'uglifyjs': function(settings, data, callbackEnd) {
    uglifyjs(settings, data, callbackEnd);
  },
  'sqwish': function(settings, data, callbackEnd) {
    sqwish(settings, data, callbackEnd);
  },
  'clean-css': function(settings, data, callbackEnd) {
    cleanCSS(settings, data, callbackEnd);
  },
  'csso': function(settings, data, callbackEnd) {
    csso(settings, data, callbackEnd);
  },
  'no-compress': function(settings, data, callbackEnd) {
    noCompress(settings, data, callbackEnd);
  }
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

  return new Promise(function(resolve, reject) {
    compressorsMap[settings.type](settings, data, function(err, data) {
      callbackEnd(err, data, settings.callback);

      if (err) {
        return reject(err);
      }

      resolve(data);
    });
  });
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

/**
 * Final callback.
 *
 * @param {Object} err
 * @param {String} dataMinified
 * @param {Function} callback
 */

function callbackEnd(err, dataMinified, callback) {
  if (callback) {
    if (err) {
      return callback(err);
    }

    callback(null, dataMinified);
  }
}
