/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var chalk = require('chalk');
var ora = require('ora');

/**
 * Expose `start() and stop()`.
 */

module.exports.start = start;
module.exports.stop = stop;
module.exports.error = error;

var spinner = ora();

function start(options) {
  spinner.text = 'Compressing file(s) with ' + chalk.green(options.compressor) + '...';
  spinner.start();
}

function stop(result) {
  spinner.text =
    'File(s) compressed successfully with ' +
    chalk.green(result.compressor) +
    ' (' +
    chalk.green(result.size) +
    ' minified, ' +
    chalk.green(result.sizeGzip) +
    ' gzipped)';
  spinner.succeed();
}

function error(options) {
  spinner.text = 'Error - file(s) not compressed with ' + chalk.red(options.compressor);
  spinner.fail();
}
