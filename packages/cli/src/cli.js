/*!
 * node-minify
 * Copyright(c) 2011-2019 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import chalk from 'chalk';
import { compress } from './compress';
import { spinnerStart, spinnerStop, spinnerError } from './spinner';

/**
 * Module variables.
 */
let silence = false;

/**
 * Run one compressor.
 */
const runOne = cli => {
  return new Promise((resolve, reject) => {
    const compressor = typeof cli.compressor === 'string' ? require(`@node-minify/${cli.compressor}`) : cli.compressor;
    const options = {
      compressorLabel: cli.compressor,
      compressor,
      input: cli.input.split(','),
      output: cli.output
    };

    if (cli.option) {
      options.options = JSON.parse(cli.option);
    }

    if (!silence) {
      spinnerStart(options);
    }

    return compress(options)
      .then(result => {
        if (!silence) {
          spinnerStop(result);
        }
        resolve(result);
      })
      .catch(err => {
        if (!silence) {
          spinnerError(options);
        }
        reject(err);
      });
  });
};

/**
 * Run cli.
 */
const run = cli => {
  silence = !!cli.silence;

  if (!silence) {
    console.log('');
    console.log(chalk.bgBlue.black(' INFO '), 'Starting compression...');
    console.log('');
  }

  return new Promise((resolve, reject) => {
    runOne(cli)
      .then(() => {
        if (!silence) {
          console.log('');
          console.log(chalk.bgGreen.black(' DONE '), chalk.green('Done!'));
          console.log('');
        }
      })
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Expose `run()`.
 */
export { run };
