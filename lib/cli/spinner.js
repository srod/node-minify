/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import chalk from 'chalk';
import ora from 'ora';

const spinner = ora();

const start = options => {
  spinner.text = 'Compressing file(s) with ' + chalk.green(options.compressor) + '...';
  spinner.start();
};

const stop = result => {
  spinner.text =
    'File(s) compressed successfully with ' +
    chalk.green(result.compressor) +
    ' (' +
    chalk.green(result.size) +
    ' minified, ' +
    chalk.green(result.sizeGzip) +
    ' gzipped)';
  spinner.succeed();
};

const error = options => {
  spinner.text = 'Error - file(s) not compressed with ' + chalk.red(options.compressor);
  spinner.fail();
};

/**
 * Expose `start() and stop()`.
 */

export { start as spinnerStart, stop as spinnerStop, error as spinnerError };
