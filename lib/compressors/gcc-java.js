/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
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
 */

function compressGCC(settings, content, legacy) {
  return execCompressor(gccCommand(settings.options, legacy), content, settings)
    .then(function(contentMinified) {
      return utils.writeFile(settings.output, contentMinified);
    })
    .catch(handleErrors);
}

function handleErrors(err) {
  if (err.message.indexOf('UnsupportedClassVersionError') > -1) {
    throw new Error('Latest Google Closure Compiler requires Java >= 1.7, please update Java or use gcc-legacy');
  }
  throw err;
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
    (legacy) ? binGccLegacy : binGcc,
    '--warning_level',
    'QUIET'
  ].concat(utils.buildArgs(options));
}
