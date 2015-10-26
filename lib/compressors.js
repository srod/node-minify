/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var glob = require('glob');
var fs = require('fs');
var os = require('os');

/**
 * Module variables.
 */

var platform = os.platform();
var binYui = __dirname + '/binaries/yuicompressor-2.4.7.jar';
var binGcc = __dirname + '/binaries/google_closure_compiler-v20130411.jar';

/**
 * Expose `compressors()`.
 */

var compressors = module.exports = {};

/**
 * YUI Compressor CSS command line.
 */

compressors.yuiCSS = function yuiCSS(settings) {
  // TODO : Merge yuiCSS and yuiJS
  return [
    'java',
    '-jar',
    '-Xss2048k',
    '"' + binYui + '"',
    '"' + settings.fileIn + '"',
    '-o ' + '"' + settings.fileOut + '"',
    '--type css',
    settings.options.join(' ')
  ].join(' ');
};

/**
 * YUI Compressor JS command line.
 */

compressors.yuiJS = function yuiJS(settings) {
  return [
    'java',
    '-jar',
    '-Xss2048k',
    '"' + binYui + '"',
    '"' + settings.fileIn + '"',
    '-o "' + settings.fileOut + '"',
    '--type js',
    settings.options.join(' ')
  ].join(' ');
};

/**
 * Google Closure Compiler command line.
 */

compressors.gcc = function gcc(settings) {
  return [
    'java',
    '-server',
    '-XX:+TieredCompilation',
    '-jar',
    '-Xss2048k',
    '"' + binGcc + '"',
    '--js="' + settings.fileIn + '"',
    '--warning_level=QUIET',
    '--language_in=' + (settings.language || 'ECMASCRIPT3'),
    '--js_output_file="' + settings.fileOut + '"',
    settings.options.join(' ')
  ].join(' ');
};

/**
 * UglifyJS command line.
 */

compressors.uglifyjs = function uglifyjs(settings) {
  return [
    '"' + getPath('uglifyjs') + '"',
    '--output "' + settings.fileOut + '"',
    '"' + settings.fileIn + '"',
    settings.options.join(' '),
    (settings.copyright ? '--comments' : '')
  ].join(' ');
};

/**
 * Sqwish command line.
 */

compressors.sqwish = function sqwish(settings) {
  return [
    '"' + getPath('sqwish') + '"',
    '"' + settings.fileIn + '"',
    '-o "' + settings.fileOut + '"',
    settings.options.join(' ')
  ].join(' ');
};

/**
 * Clean-css command line.
 */

compressors.cleanCss = function cleanCss(settings) {
  return [
    '"' + getPath('cleancss') + '"',
    '"' + settings.fileIn + '"',
    '-o "' + settings.fileOut + '"',
    settings.options.join(' ')
  ].join(' ');
};

/**
 * CSSO command line.
 */

compressors.csso = function csso(settings) {
  return [
    '"' + getPath('csso') + '"',
    '-i "' + settings.fileIn + '"',
    '-o "' + settings.fileOut + '"',
    settings.options.join(' ')
  ].join(' ');
};

/**
 * No compression, only concatenation.
 */

compressors.noCompress = function noCompress(settings) {
  fs.createReadStream(settings.fileIn, {encoding: 'utf8'})
    .pipe(fs.createWriteStream(settings.fileOut));
  return '';
};

/**
 * Get the binary path in node_modules '.bin' folder.
 * @param {String} bin
 * @return {String}
 */

function getPath(bin) {
  var binPath = glob.sync('**/.bin/' + bin + ((platform === 'win32') ? '.cmd' : ''), {realpath: true})[0];
  if (!binPath) {
    throw new Error(bin + ' not found !');
  }
  return binPath;
}
