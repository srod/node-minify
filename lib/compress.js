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

function setTempFile(fileIn, tempPath) {
  var output = {};
  //var outTempFile = fs.createWriteStream(settings.tempFile);
  //var tempFile = '/' + new Date().getTime().toString() + '-' + uuid.v4() + '.tmp';
  output.tempFile = path.normalize(
    tempPath +
    '/' + new Date().getTime().toString() + '-' + uuid.v4() + '.tmp'
  );

  //if (Array.isArray(settings.fileIn) && settings.type !== 'gcc') {
  if (Array.isArray(fileIn)) {
    var out = fileIn.map(function(path) {
      return fs.readFileSync(path, 'utf8');
    });
    fs.writeFileSync(output.tempFile, out.join('\n'), 'utf8');
    output.fileIn = output.tempFile;
    /*settings.fileIn.forEach(function(path) {
     fs.createReadStream(path, {encoding: 'utf8'}).pipe(outTempFile);
     });
     output.fileIn = settings.tempFile;
     outTempFile.end(function(err) {
     return callback(err, output);
     });*/
  }

  return output;
}

function createDirectory(file) {
  mkdirp.sync(file.substr(0, file.lastIndexOf('/')));
}

/**
 * Run compressor.
 *
 * @return {Function}
 */

function compress(setup) {
  var command;

  createDirectory(setup.fileOut);
  setup = extend(setup, setTempFile(setup.fileIn, setup.tempPath));

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
