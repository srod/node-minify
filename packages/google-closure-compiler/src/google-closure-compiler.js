/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import compiler from 'google-closure-compiler';
import { utils } from '@node-minify/utils';

/**
 * Module variables.
 */
const ClosureCompiler = compiler.jsCompiler;

// the allowed flags, taken from https://github.com/google/closure-compiler
const allowedFlags = [
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
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyGCC = ({ settings, content, callback, index }) => {
  const options = applyOptions({}, settings.options);
  const gcc = new ClosureCompiler(options);
  const contentMinified = gcc.run([{ src: content }], (exitCode, stdOut, stdErr) => {
    if (exitCode > 0 && callback) {
      return callback(stdErr);
    }
  });
  if (!settings.content) {
    utils.writeFile({ file: settings.output, content: contentMinified.compiledCode, index });
  }

  /**
   * Write GCC sourceMap
   * If the createSourceMap option is passed we'll write the sourceMap file
   * If createSourceMap is a boolean we'll append .map to the settings.output file path
   * otherwise use createSourceMap as the file path.
   */

  if (settings.options.createSourceMap) {
    const sourceMapOutput =
      typeof settings.options.createSourceMap === 'boolean'
        ? settings.output + '.map'
        : settings.options.createSourceMap;
    utils.writeFile({ file: sourceMapOutput, content: contentMinified.sourceMap, index });
  }

  if (callback) {
    return callback(null, contentMinified.compiledCode);
  }
  return contentMinified.compiledCode;
};

/**
 * Adds any valid options passed in the options parameters to the flags parameter and returns the flags object.
 * @param {Object} flags
 * @param {Object} options
 * @returns {Object} flags
 */
const applyOptions = (flags, options) => {
  if (!options || Object.keys(options).length === 0) {
    return flags;
  }
  Object.keys(options)
    .filter(option => allowedFlags.indexOf(option) > -1)
    .forEach(option => (flags[option] = options[option]));
  return flags;
};

/**
 * Expose `minifyGCC()`.
 */
module.exports = minifyGCC;
