/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var HTMLMinifier = require('html-minifier').minify;
var utils = require('../utils');

/**
 * Module variables.
 */

var defaultOptions = {
  collapseBooleanAttributes: true,
  collapseInlineTagWhitespace: true,
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
  removeAttributeQuotes: true,
  removeCDATASectionsFromCDATA: true,
  removeComments: true,
  removeCommentsFromCDATA: true,
  removeEmptyAttributes: true,
  removeOptionalTags: true,
  removeRedundantAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  useShortDoctype: true
};

/**
 * Expose `compressHTMLMinifier()`.
 */

module.exports = compressHTMLMinifier;

/**
 * Run html-minifier.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressHTMLMinifier(settings, content, callback, index) {
  var options = Object.assign({}, defaultOptions, settings.options);
  var contentMinified = HTMLMinifier(content, options);
  utils.writeFile(settings.output, contentMinified, index);
  if (callback) {
    return callback(null, contentMinified);
  }
  return contentMinified;
}
