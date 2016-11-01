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
 * @param {String} content
 */

function compressUglifyJS(settings, content) {
  return new Promise(function(resolve) {
    var options = settings.options;
    options.fromString = true;
    var contentMinified = uglifyJS.minify(content, options);
    utils.writeFile(settings.output, contentMinified.code);
    resolve(contentMinified.code);
  });
}
