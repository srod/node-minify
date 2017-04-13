/*!
 * node-minify
 * Copyright(c) 2011-2017 Rodolphe Stoclin
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
 * @param {String} content
 * @param {Array} args
 */

function runAsync(content, args) {
  return new Promise(function(resolve, reject) {
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
        return reject(new Error(stderr));
      }

      resolve(stdout);
    });

    child.stdout.on('data', function(chunk) {
      stdout += chunk;
    });
    child.stderr.on('data', function(chunk) {
      stderr += chunk;
    });

    child.stdin.end(content);
  });
}

/**
 * Exec command as sync.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {String} args
 */

function runSync(settings, content, args) {
  return new Promise(function(resolve, reject) {
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
        return reject(new Error(stderr));
      }

      resolve(stdout);
    } catch (err) {
      reject(err);
    }
  });
}
