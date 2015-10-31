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
var binYui = __dirname + '/../binaries/yuicompressor-2.4.7.jar';

/**
 * Expose `compressYUI()`.
 */

module.exports = compressYUI;

/**
 * Run YUI Compressor.
 *
 * @param {String} type
 * @param {Object} settings
 * @param {Function} callbackEnd
 */

function compressYUI(type, settings, callbackEnd) {
  execCompressor(yuiCommand(type, settings), settings, callbackEnd);
}

/**
 * YUI Compressor CSS command line.
 */

function yuiCommand(type, settings) {
  return [
    'java',
    '-jar',
    '-Xss2048k',
    '"' + binYui + '"',
    '"' + settings.fileIn + '"',
    '-o ' + '"' + settings.fileOut + '"',
    '--type ' + type,
    settings.options.join(' ')
  ].join(' ');
}
