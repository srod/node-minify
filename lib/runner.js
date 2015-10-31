/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

/**
 * Expose `runCommandLine()`.
 */

module.exports = runCommandLine;

/**
 * Run the command line with exec.
 *
 * @param {String} command
 * @param {Object} settings
 * @param {Function} callbackEnd
 */

function runCommandLine(command, settings, callbackEnd) {
  if (settings.sync) {
    return runSync(settings, command, callbackEnd);
  }

  runAsync(settings, command, callbackEnd);
}

/**
 * Exec command as async.
 *
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
 *
 * @param {Object} settings
 * @param {String} command
 * @param {Function} callbackEnd
 */

function runSync(settings, command, callbackEnd) {
  try {
    execSync(command, {maxBuffer: settings.buffer});
    callbackEnd(null, settings);
  } catch (e) {
    callbackEnd(e, settings);
  }
}
