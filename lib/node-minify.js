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
var setup = require('./setup');
var compress = require('./compress');

/**
 * Expose `minify()`.
 */

var app = module.exports = {};

/**
 * Run minifier.
 *
 * @return {Function}
 */

app.minify = function minify(options) {
  if (this.constructor.name === 'minify') {
    deprecate('Instantiate is no longer necessary.\n' +
      'new compressor.minify() is deprecated.\n' +
      'Please use:\n' +
      '\n' +
      '  var compressor = require("node-minify");\n' +
      '  compressor.minify();\n' +
      '\n'
    );
  }
  compress(setup(options));
};
