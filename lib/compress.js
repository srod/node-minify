/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var fs = require('fs');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var compressors = require('./compressors');

/**
 * Expose `compress()`.
 */

module.exports = compress;

/**
 * Run compressor.
 *
 * @return {Function}
 */

function compress(setup) {
  var command;

  switch (setup.type) {
    case 'yui':
    case 'yui-css':
      command = compressors.yuiCSS(setup);
      break;
    case 'yui-js':
      command = compressors.yuiJS(setup);
      break;
    case 'gcc':
      command = compressors.gcc(setup);
      break;
    case 'uglifyjs':
      command = compressors.uglifyjs(setup);
      break;
    case 'sqwish':
      command = compressors.sqwish(setup);
      break;
    case 'clean-css':
      command = compressors.cleanCss(setup);
      break;
    case 'csso':
      command = compressors.csso(setup);
      break;
    case 'no-compress':
      command = compressors.noCompress(setup);
      break;
    default:
      throw new Error('Type does not exist');
  }

  if (setup.sync) {
    runSync(setup, command, callbackEnd);
    return;
  }

  runAsync(setup, command, callbackEnd);
}

/**
 * Exec as async.
 *
 * @return {Function}
 */

function runAsync(setup, command, callbackEnd) {
  exec(command, {maxBuffer: setup.buffer}, function(err) {
    callbackEnd(err, setup);
  });
}

/**
 * Exec as sync.
 *
 * @return {Function}
 */

function runSync(setup, command, callbackEnd) {
  if (command !== '') {
    try {
      execSync(command, {maxBuffer: setup.buffer});
      callbackEnd(null, setup);
    } catch (e) {
      callbackEnd(e, setup);
    }
  } else {
    callbackEnd(null, setup);
  }
}

/**
 * Final callback.
 *
 * @return {Function}
 */

function callbackEnd(err, setup) {
  if (setup.fileIn === setup.tempFile) {
    // remove the temp concat file here
    fs.unlink(setup.tempFile);
  }

  if (setup.callback) {
    if (err) {
      setup.callback(err);
      return;
    }

    setup.callback(null, fs.readFileSync(setup.fileOut, 'utf8'));
  }
}
