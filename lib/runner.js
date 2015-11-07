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
var Promise = require('bluebird');

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
 */

function runCommandLine(args, data, settings) {
  if (settings.sync) {
    return runSync(settings, data, args);
  }

  return runAsync(data, args);
}

/**
 * Exec command as async.
 *
 * @param {String} data
 * @param {Array} args
 */

function runAsync(data, args) {
  return new Promise(function(resolve, reject) {
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
      if (code !== 0) {
        return reject(new Error(stderr));
      }

      resolve(stdout);
    });
  });
}

/**
 * Exec command as sync.
 *
 * @param {Object} settings
 * @param {String} data
 * @param {String} args
 */

function runSync(settings, data, args) {
  return new Promise(function(resolve, reject) {
    try {
      var child = childProcess.spawnSync('java', args, {
        input: data,
        stdio: 'pipe',
        maxBuffer: settings.buffer
      });
      var stdout = child.stdout.toString();
      var stderr = child.stderr.toString();
      var code = child.status;

      if (code !== 0) {
        return reject(new Error(stderr));
      }

      resolve(stdout);
    } catch (err) {
      reject(err);
    }
  });
}
