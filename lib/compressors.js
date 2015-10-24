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

compressors.yuiCSS = function yuiCSS(setup) {
  return [
    'java',
    '-jar',
    '-Xss2048k',
    '"' + binYui + '"',
    '"' + setup.fileIn + '"',
    '-o ' + '"' + setup.fileOut + '"',
    '--type css',
    setup.options.join(' ')
  ].join(' ');
};

/**
 * YUI Compressor JS command line.
 */

compressors.yuiJS = function yuiJS(setup) {
  return [
    'java',
    '-jar',
    '-Xss2048k',
    '"' + binYui + '"',
    '"' + setup.fileIn + '"',
    '-o "' + setup.fileOut + '"',
    '--type js',
    setup.options.join(' ')
  ].join(' ');
};

/**
 * Google Closure Compiler command line.
 */

compressors.gcc = function gcc(setup) {
  // gcc need an array
  if (typeof setup.fileIn === 'string') {
    setup.fileIn = [setup.fileIn];
  }
  var fileInCommand = setup.fileIn.map(function(file) {
    return '--js="' + file + '"';
  });
  return [
    'java',
    '-server',
    '-XX:+TieredCompilation',
    '-jar',
    '-Xss2048k',
    '"' + binGcc + '"',
    fileInCommand.join(' '),
    '--warning_level=QUIET',
    '--language_in=' + (setup.language || 'ECMASCRIPT3'),
    '--js_output_file="' + setup.fileOut + '"',
    setup.options.join(' ')
  ].join(' ');
};

/**
 * UglifyJS command line.
 */

compressors.uglifyjs = function uglifyjs(setup) {
  return [
    '"' + getPath('uglifyjs') + '"',
    '--output "' + setup.fileOut + '"',
    '"' + setup.fileIn + '"',
    setup.options.join(' '),
    (setup.copyright ? '--comments' : '')
  ].join(' ');
};

/**
 * Sqwish command line.
 */

compressors.sqwish = function sqwish(setup) {
  return [
    '"' + getPath('sqwish') + '"',
    '"' + setup.fileIn + '"',
    '-o "' + setup.fileOut + '"',
    setup.options.join(' ')
  ].join(' ');
};

/**
 * Clean-css command line.
 */

compressors.cleanCss = function cleanCss(setup) {
  return [
    '"' + getPath('cleancss') + '"',
    '"' + setup.fileIn + '"',
    '-o "' + setup.fileOut + '"',
    setup.options.join(' ')
  ].join(' ');
};

/**
 * CSSO command line.
 */

compressors.csso = function csso(setup) {
  return [
    '"' + getPath('csso') + '"',
    '-i "' + setup.fileIn + '"',
    '-o "' + setup.fileOut + '"',
    setup.options.join(' ')
  ].join(' ');
};

/**
 * No compression, only concatenation.
 */

compressors.noCompress = function noCompress(setup) {
  var fileIn = fs.readFileSync(setup.fileIn);
  fs.writeFileSync(setup.fileOut, fileIn);
  return '';
};

/**
 * Get the binary path in node_modules '.bin' folder.
 */

function getPath(bin) {
  var binPath = glob.sync('**/.bin/' + bin + ((platform === 'win32') ? '.cmd' : ''), {realpath: true})[0];
  if (!binPath) {
    throw new Error(bin + ' not found !');
  }
  return binPath;
}
