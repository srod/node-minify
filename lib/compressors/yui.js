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
 * @param {String} content
 */

function compressYUI(type, settings, content) {
  return execCompressor(yuiCommand(type, settings.options), content, settings)
    .then(function(contentMinified) {
      return utils.writeFile(settings.output, contentMinified);
    });
}

/**
 * YUI Compressor CSS command line.
 */

function yuiCommand(type, options) {
  return [
    '-jar',
    '-Xss2048k',
    binYui,
    '--type',
    type
  ].concat(utils.buildArgs(options));
}
