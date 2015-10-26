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
var path = require('path');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var uuid = require('node-uuid');
var mkdirp = require('mkdirp');
var extend = require('xtend');
var compressors = require('./compressors');

/**
 * Expose `compress()`.
 */

module.exports = compress;

/**
 * Run compressor.
 * @param {Object} settings
 */

function compress(settings) {
  var command;

  createDirectory(settings.fileOut);
  settings = extend(settings, setTempFile(settings.fileIn, settings.tempPath));

  // TODO : refactor switch
  switch (settings.type) {
    case 'yui':
    case 'yui-css':
      command = compressors.yuiCSS(settings);
      break;
    case 'yui-js':
      command = compressors.yuiJS(settings);
      break;
    case 'gcc':
      command = compressors.gcc(settings);
      break;
    case 'uglifyjs':
      command = compressors.uglifyjs(settings);
      break;
    case 'sqwish':
      command = compressors.sqwish(settings);
      break;
    case 'clean-css':
      command = compressors.cleanCss(settings);
      break;
    case 'csso':
      command = compressors.csso(settings);
      break;
    case 'no-compress':
      command = compressors.noCompress(settings);
      break;
    default:
      throw new Error('Type does not exist');
  }

  if (settings.sync) {
    return runSync(settings, command, callbackEnd);
  }

  runAsync(settings, command, callbackEnd);
}

/**
 * Create the temporary file, concatenate on all input files.
 * @param {String|Array} fileIn
 * @param {String} tempPath
 * @return {Object}
 */

function setTempFile(fileIn, tempPath) {
  var output = {};

  if (!Array.isArray(fileIn)) {
    return output;
  }

  output.tempFile = path.normalize(
    tempPath +
    '/' + new Date().getTime().toString() + '-' + uuid.v4() + '.tmp'
  );

  var out = fileIn.map(function(path) {
    return fs.readFileSync(path, 'utf8');
  });
  fs.writeFileSync(output.tempFile, out.join('\n'), 'utf8');
  output.fileIn = output.tempFile;

  return output;
}

/**
 * Create folder of the target file.
 * @param {String} file - Full path of the file
 */

function createDirectory(file) {
  mkdirp.sync(file.substr(0, file.lastIndexOf('/')));
}

/**
 * Exec command as async.
 * @param {Object} settings
 * @param {String} command
 * @param {Function} callbackEnd
 */

function runAsync(settings, command, callbackEnd) {
  exec(command, {maxBuffer: settings.buffer}, function(err) {
    callbackEnd(err, settings);
  });
}

/**
 * Exec command as sync.
 * @param {Object} settings
 * @param {String} command
 * @param {Function} callbackEnd
 */

function runSync(settings, command, callbackEnd) {
  if (command !== '') {
    try {
      execSync(command, {maxBuffer: settings.buffer});
      callbackEnd(null, settings);
    } catch (e) {
      callbackEnd(e, settings);
    }
  } else {
    callbackEnd(null, settings);
  }
}

/**
 * Final callback.
 * @param {Object} err
 * @param {Object} settings
 */

function callbackEnd(err, settings) {
  if (settings.tempFile) {
    fs.unlink(settings.tempFile);
  }

  if (settings.callback) {
    if (err) {
      return settings.callback(err);
    }

    settings.callback(null, fs.readFileSync(settings.fileOut, 'utf8'));
  }
}
