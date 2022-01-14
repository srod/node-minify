/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import chalk from 'chalk';
import ora from 'ora';

const spinner = ora();

/**
 * Start spinner.
 *
 * @param {Object} options
 */
const start = options => {
  spinner.text = 'Compressing file(s) with ' + chalk.green(options.compressorLabel) + '...';
  spinner.start();
};

/**
 * Stop spinner.
 *
 * @param {Object} result
 */
const stop = result => {
  spinner.text =
    'File(s) compressed successfully with ' +
    chalk.green(result.compressorLabel) +
    ' (' +
    chalk.green(result.size) +
    ' minified, ' +
    chalk.green(result.sizeGzip) +
    ' gzipped)';
  spinner.succeed();
};

/**
 * Mark spinner as failed.
 *
 * @param {Object} options
 */
const error = options => {
  spinner.text = 'Error - file(s) not compressed with ' + chalk.red(options.compressorLabel);
  spinner.fail();
};

/**
 * Expose `start(), stop() and error()`.
 */
export { start as spinnerStart, stop as spinnerStop, error as spinnerError };
