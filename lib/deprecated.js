/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
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
  if (constructorName === 'minify') {
    deprecate(
      'Instantiate is no longer necessary.\n' +
        'new compressor.minify() is deprecated.\n' +
        'Please use:\n' +
        '\n' +
        '  var compressor = require("node-minify");\n' +
        '  compressor.minify();\n' +
        '\n'
    );
  }

  if (settings.type) {
    deprecate('type was renamed to compressor');
  }

  if (settings.fileIn) {
    deprecate('fileIn was renamed to input');
  }

  if (settings.fileOut) {
    deprecate('fileOut was renamed to output');
  }

  if (settings.compressor === 'babili') {
    deprecate('babili was renamed to babel-minify');
  }
}
