/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
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
 * @param {Array} args
 * @param {String} data
 * @param {Object} settings
 * @param {Function} callback
 */

function runCommandLine(args, data, settings, callback) {
  if (settings.sync) {
    return runSync(settings, data, args, callback);
  }

  return runAsync(data, args, callback);
}

/**
 * Exec command as async.
 *
 * @param {String} content
 * @param {Array} args
 * @param {Function} callback
 */

function runAsync(content, args, callback) {
  var stdout = '';
  var stderr = '';

  var child = childProcess.spawn('java', args, {
    stdio: 'pipe'
  });

  child.on('error', console.log.bind(console, 'child'));
  child.stdin.on('error', console.log.bind(console, 'child.stdin'));
  child.stdout.on('error', console.log.bind(console, 'child.stdout'));
  child.stderr.on('error', console.log.bind(console, 'child.stderr'));

  child.on('exit', function(code) {
    if (code !== 0) {
      return callback(new Error(stderr));
    }

    return callback(null, stdout);
  });

  child.stdout.on('data', function(chunk) {
    stdout += chunk;
  });
  child.stderr.on('data', function(chunk) {
    stderr += chunk;
  });

  child.stdin.end(content);
}

/**
 * Exec command as sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Array} args
 * @param {Function} callback
 */

function runSync(settings, content, args, callback) {
  try {
    var child = childProcess.spawnSync('java', args, {
      input: content,
      stdio: 'pipe',
      maxBuffer: settings.buffer
    });
    var stdout = child.stdout.toString();
    var stderr = child.stderr.toString();
    var code = child.status;

    if (code !== 0) {
      return callback(new Error(stderr));
    }

    return callback(null, stdout);
  } catch (err) {
    return callback(err);
  }
}
