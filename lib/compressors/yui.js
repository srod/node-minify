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
var binYui = path.normalize(__dirname + '/../binaries/yuicompressor-2.4.7.jar');

/**
 * Expose `compressYUI()`.
 */

module.exports = compressYUI;

/**
 * Run YUI Compressor.
 *
 * @param {String} type
 * @param {Object} settings
 * @param {String} data
 * @param {Function} callbackEnd
 */

function compressYUI(type, settings, data, callbackEnd) {
  execCompressor(yuiCommand(type, settings), data, settings, function(err, dataMinified) {
    if (err) {
      return callbackEnd(err, settings);
    }

    fs.writeFileSync(settings.fileOut, dataMinified, 'utf8');
    callbackEnd(null, settings, dataMinified);
  });
}

/**
 * YUI Compressor CSS command line.
 */

function yuiCommand(type) {
  return [
    '-jar',
    '-Xss2048k',
    binYui,
    '--type',
    type
    //settings.options.join(' ')
  ];
}
