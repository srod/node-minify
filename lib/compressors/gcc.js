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
 * @param {String} data
 */

function compressGCC(settings, data) {
  return execCompressor(gccCommand(settings), data, settings)
    .then(function(data) {
      fs.writeFileSync(settings.fileOut, data, 'utf8');
      return data;
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

function gccCommand(settings) {
  var args = [];
  var options = settings.options;

  // TODO : refactoring
  Object.keys(options).forEach(function(key) {
    if (options[key] && options[key] !== false) {
      args.push('--' + key);
    }

    if (options[key] && options[key] !== true) {
      args.push(options[key]);
    }
  });

  return [
    '-server',
    '-XX:+TieredCompilation',
    '-jar',
    '-Xss2048k',
    binGcc,
    '--warning_level',
    'QUIET'
  ].concat(args);
}
