/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var path = require('path');
var utils = require('../utils');
var execCompressor = require('../runner');

/**
 * Module variables.
 */

var binGcc = path.normalize(__dirname + '/../binaries/google_closure_compiler-v20151216.jar');
var binGccLegacy = path.normalize(__dirname + '/../binaries/google_closure_compiler-v20131014-legacy-java-1.6.jar');

/**
 * Expose `compressGCC()`.
 */

module.exports = compressGCC;

/**
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Boolean} legacy
 * @param {Function} callback
 */

function compressGCC(settings, content, callback, legacy, index) {
  return execCompressor(gccCommand(settings.options, legacy), content, settings, function(err, contentMinified) {
    if (err) {
      return handleErrors(err, callback);
    }
    utils.writeFile(settings.output, contentMinified, index);
    if (callback) {
      return callback(null, contentMinified);
    }
    return contentMinified;
  });
}

function handleErrors(err, callback) {
  var message = null;
  if (err.message.indexOf('UnsupportedClassVersionError') > -1) {
    message = 'Latest Google Closure Compiler requires Java >= 1.7, please update Java or use gcc-legacy';
  }

  if (callback) {
    return callback(message || err);
  } else {
    throw message || err;
  }
}

/**
 * Google Closure Compiler command line.
 */

function gccCommand(options, legacy) {
  return [
    '-server',
    '-XX:+TieredCompilation',
    '-jar',
    '-Xss2048k',
    legacy ? binGccLegacy : binGcc,
    '--warning_level',
    'QUIET'
  ].concat(utils.buildArgs(options));
}
