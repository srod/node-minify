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

const start = compressor => {
  spinner.text = 'Compressing file(s) with ' + chalk.green(compressor) + '...';
  spinner.start();
};

const stop = compressor => {
  spinner.text = 'File(s) compressed successfully with ' + chalk.green(compressor);
  spinner.succeed();
};

const error = compressor => {
  spinner.text = 'Error - file(s) not compressed with ' + chalk.red(compressor);
  spinner.fail();
};

/**
 * Expose `start() and stop()`.
 */

export { start as spinnerStart, stop as spinnerStop, error as spinnerError };
