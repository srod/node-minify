/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var deprecated = require('./deprecated');
var setup = require('./setup');
var compress = require('./compress');

/**
 * Expose `minify()`.
 */

var app = module.exports = {};

/**
 * Run node-minify.
 *
 * @param {Object} settings - Settings from user input
 */

app.minify = function minify(settings) {
  deprecated(this.constructor.name, settings);
  settings = setup(settings);
  return compress(settings).nodeify(settings.callback);
};
