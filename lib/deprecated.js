/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var deprecate = require('depd')('node-minify');

/**
 * Expose `deprecated()`.
 */

module.exports = deprecated;

/**
 * Deprecate some old syntax.
 *
 * @param {String} constructorName
 * @param {Object} settings
 */

function deprecated(constructorName, settings) {
  //deprecate.property(settings, 'type');
  //deprecate.property(settings, 'fileIn');
  //deprecate.property(settings, 'fileOut');
  if (constructorName === 'minify') {
    deprecate('Instantiate is no longer necessary.\n' +
      'new compressor.minify() is deprecated.\n' +
      'Please use:\n' +
      '\n' +
      '  var compressor = require("node-minify");\n' +
      '  compressor.minify();\n' +
      '\n'
    );
  }
}
