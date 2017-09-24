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
 */

function compressGCCJS(settings, content) {
  return new Promise(function(resolve) {
    var flags = { jsCode: [{ src: content }] };
    flags = applyOptions(flags, settings.options);
    var contentMinified = gcc.compile(flags);
    utils.writeFile(settings.output, contentMinified.compiledCode);
    resolve(contentMinified.compiledCode);
  });
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
