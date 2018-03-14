/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var gcc = require('google-closure-compiler-js');
var utils = require('../utils');
// the allowed flags, taken from https://github.com/google/closure-compiler-js
var allowedFlags = [
  'angularPass',
  'applyInputSourceMaps',
  'assumeFunctionWrapper',
  'checksOnly',
  'compilationLevel',
  'createSourceMap',
  'dartPass',
  'defines',
  'env',
  'externs',
  'exportLocalPropertyDefinitions',
  'generateExports',
  'languageIn',
  'languageOut',
  'newTypeInf',
  'outputWrapper',
  'polymerVersion',
  'preserveTypeAnnotations',
  'processCommonJsModules',
  'renamePrefixNamespace',
  'rewritePolyfills',
  'useTypesForOptimization',
  'warningLevel'
];

/**
 * Expose `compressGCCJS()`.
 */

module.exports = compressGCCJS;

/**
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */

function compressGCCJS(settings, content, callback) {
  var flags = { jsCode: [{ src: content }] };
  flags = applyOptions(flags, settings.options);
  var contentMinified = gcc.compile(flags);
  utils.writeFile(settings.output, contentMinified.compiledCode);

  /**
   * Write GCC sourceMap
   * If the createSourceMap option is passed we'll write the sourceMap file
   * If createSourceMap is a boolean we'll append .map to the settings.output file path
   * otherwise use createSourceMap as the file path.
   */

  if (settings.options.createSourceMap) {
    var sourceMapOutput =
      typeof settings.options.createSourceMap === 'boolean'
        ? settings.output + '.map'
        : settings.options.createSourceMap;
    utils.writeFile(sourceMapOutput, contentMinified.sourceMap);
  }

  if (callback) {
    return callback(null, contentMinified.compiledCode);
  }
  return contentMinified.compiledCode;
}

/**
 * Adds any valid options passed in the options parameters to the flags parameter and returns the flags object.
 * @param {Object} flags
 * @param {Object} options
 * @returns {Object} flags
 */

function applyOptions(flags, options) {
  if (!options || Object.keys(options).length === 0) {
    return flags;
  }
  Object.keys(options)
    .filter(function(option) {
      return allowedFlags.indexOf(option) > -1;
    })
    .forEach(function(option) {
      return (flags[option] = options[option]);
    });
  return flags;
}
