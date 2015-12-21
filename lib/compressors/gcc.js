/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
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
var binGcc = path.normalize(__dirname + '/../binaries/google_closure_compiler-v20151015.jar');

/**
 * Expose `compressGCC()`.
 */

module.exports = compressGCC;

/**
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {String} content
 */

function compressGCC(settings, content) {
  return execCompressor(gccCommand(settings.options), content, settings)
    .then(function(contentMinified) {
      return utils.writeFile(settings.output, contentMinified);
    })
    .catch(handleErrors);
}

function handleErrors(err) {
  if (err.message.indexOf('UnsupportedClassVersionError') > -1) {
    throw new Error('Google Closure Compiler requires Java >= 1.7');
  }
  throw err;
}

/**
 * Google Closure Compiler command line.
 */

function gccCommand(options) {
  return [
    '-server',
    '-XX:+TieredCompilation',
    '-jar',
    '-Xss2048k',
    binGcc,
    '--warning_level',
    'QUIET'
  ].concat(utils.buildArgs(options));
}
