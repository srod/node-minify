/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var gcc = require('google-closure-compiler-js');
var utils = require('../utils');

/**
 * Expose `compressGCCJS()`.
 */

module.exports = compressGCCJS;

/**
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {String} content
 */

function compressGCCJS(settings, content) {
  return new Promise(function(resolve) {
    var contentMinified = gcc.compile({jsCode: [{src: content}]}); // TODO add settings
    utils.writeFile(settings.output, contentMinified.compiledCode);
    resolve(contentMinified.compiledCode);
  });
}
