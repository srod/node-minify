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
var binGcc = path.normalize(__dirname + '/../binaries/google_closure_compiler-v20130411.jar');

/**
 * Expose `compressGCC()`.
 */

module.exports = compressGCC;

/**
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {String} data
 * @param {Function} callbackEnd
 */

function compressGCC(settings, data, callbackEnd) {
  execCompressor(gccCommand(settings), data, settings, function(err, dataMinified) {
    if (err) {
      return callbackEnd(err, settings);
    }

    fs.writeFileSync(settings.fileOut, dataMinified, 'utf8');
    callbackEnd(null, settings, dataMinified);
  });
}

/**
 * Google Closure Compiler command line.
 */

function gccCommand(settings) {
  var args = [];
  var options = settings.options;

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
    'QUIET',
    '--language_in',
    (settings.language || 'ECMASCRIPT3')
  ].concat(args);
}
