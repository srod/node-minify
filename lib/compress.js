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
var path = require('path');
var extend = require('xtend');
var mkdirp = require('mkdirp');
var uuid = require('node-uuid');
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
  'yui': function(settings, callbackEnd) {
    yui('css', settings, callbackEnd);
  },
  'yui-css': function(settings, callbackEnd) {
    yui('css', settings, callbackEnd);
  },
  'yui-js': function(settings, callbackEnd) {
    yui('js', settings, callbackEnd);
  },
  'gcc': function(settings, callbackEnd) {
    gcc(settings, callbackEnd);
  },
  'uglifyjs': function(settings, callbackEnd) {
    uglifyjs(settings, callbackEnd);
  },
  'sqwish': function(settings, callbackEnd) {
    sqwish(settings, callbackEnd);
  },
  'clean-css': function(settings, callbackEnd) {
    cleanCSS(settings, callbackEnd);
  },
  'csso': function(settings, callbackEnd) {
    csso(settings, callbackEnd);
  },
  'no-compress': function(settings, callbackEnd) {
    noCompress(settings, callbackEnd);
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
  createDirectory(settings.fileOut);
  settings = extend(settings, setTempFile(settings.fileIn, settings.tempPath));

  if (typeof compressorsMap[settings.type] !== 'function') {
    throw new Error('Type "' + settings.type + '" does not exist');
  }

  compressorsMap[settings.type](settings, callbackEnd);
}

/**
 * Create the temporary file, concatenate on all input files.
 *
 * @param {String|Array} fileIn
 * @param {String} tempPath
 * @return {Object}
 */

function setTempFile(fileIn, tempPath) {
  var output = {};

  if (!Array.isArray(fileIn)) {
    return output;
  }

  output.tempFile = path.normalize(
    tempPath +
    '/' + new Date().getTime().toString() + '-' + uuid.v4() + '.tmp'
  );

  var out = fileIn.map(function(path) {
    return fs.readFileSync(path, 'utf8');
  });
  fs.writeFileSync(output.tempFile, out.join('\n'), 'utf8');
  output.fileIn = output.tempFile;

  return output;
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
 * @param {Object} settings
 */

function callbackEnd(err, settings) {
  if (settings.tempFile) {
    fs.unlink(settings.tempFile);
  }

  if (settings.callback) {
    if (err) {
      return settings.callback(err);
    }

    settings.callback(null, fs.readFileSync(settings.fileOut, 'utf8'));
  }
}
