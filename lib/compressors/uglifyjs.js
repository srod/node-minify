/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var Promise = require('bluebird');
var uglifyJS = require('uglify-js');
var utils = require('../utils');

/**
 * Expose `compressUglifyJS()`.
 */

module.exports = compressUglifyJS;

/**
 * Run uglifyJS.
 *
 * @param {Object} settings
 * @param {String} data
 */

function compressUglifyJS(settings, data) {
  return new Promise(function(resolve) {
    var options = settings.options;
    options.fromString = true;
    var result = uglifyJS.minify(data, options);
    utils.writeFile(settings.output, result);
    resolve(result.code);
  });
}
