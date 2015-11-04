/*!
 * node-minify
 * Copyright(c) 2011-2016 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var childProcess = require('child_process');

/**
 * Expose `runCommandLine()`.
 */

module.exports = runCommandLine;

/**
 * Run the command line with spawn.
 *
 * @param {String} args
 * @param {String} data
 * @param {Object} settings
 * @param {Function} callback
 */

function runCommandLine(args, data, settings, callback) {
  if (settings.sync) {
    return runSync(settings, data, args, callback);
  }

  runAsync(data, args, callback);
}

/**
 * Exec command as async.
 *
 * @param {String} data
 * @param {Array} args
 * @param {Function} callback
 */

function runAsync(data, args, callback) {
  var stdout = '';
  var stderr = '';

  var child = childProcess.spawn('java', args, {
    stdio: 'pipe'
  });

  child.stdin.end(data);

  child.stdout.on('data', function(chunk) {
    stdout += chunk;
  });
  child.stderr.on('data', function(chunk) {
    stderr += chunk;
  });

  child.on('exit', function(code) {
    var err = null;

    if (code !== 0) {
      err = new Error(stderr);
    }

    callback(err, stdout);
  });
}

/**
 * Exec command as sync.
 *
 * @param {Object} settings
 * @param {String} data
 * @param {String} args
 * @param {Function} callback
 */

function runSync(settings, data, args, callback) {
  try {
    var child = childProcess.spawnSync('java', args, {
      input: data,
      stdio: 'pipe',
      maxBuffer: settings.buffer
    });
    var stdout = child.stdout.toString();
    var stderr = child.stderr.toString();
    var code = child.status;
    var err = null;

    if (code !== 0) {
      err = new Error(stderr);
    }

    callback(err, stdout);
  } catch (err) {
    callback(err);
  }
}
