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
var execCompressor = require('../runner');

/**
 * Module variables.
 */
var binGcc = __dirname + '/../binaries/google_closure_compiler-v20130411.jar';

/**
 * Expose `compressGCC()`.
 */

module.exports = compressGCC;

/**
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {Function} callbackEnd
 */

function compressGCC(settings, callbackEnd) {
  execCompressor(gccCommand(settings), settings, callbackEnd);
}

/**
 * Google Closure Compiler command line.
 */

function gccCommand(settings) {
  return [
    'java',
    '-server',
    '-XX:+TieredCompilation',
    '-jar',
    '-Xss2048k',
    '"' + binGcc + '"',
    '--js="' + settings.fileIn + '"',
    '--warning_level=QUIET',
    '--language_in=' + (settings.language || 'ECMASCRIPT3'),
    '--js_output_file="' + settings.fileOut + '"',
    settings.options.join(' ')
  ].join(' ');
}
