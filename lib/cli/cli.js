/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import chalk from 'chalk';
import depd from 'depd';
import { compress } from './compress';
import { spinnerStart, spinnerStop, spinnerError } from './spinner';

/**
 * Module variables.
 */

const deprecate = depd('node-minify');
let silence = false;

/**
 * Run one compressor.
 */

const runOne = (cli, compressor) => {
  return new Promise((resolve, reject) => {
    const options = {
      compressor: compressor || cli.compressor,
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
    if (cli.compressor === 'all') {
      deprecate('all is deprecated, babel-minify will be used by default');
      console.log('');
      cli.compressor = 'babel-minify';
    }

    runOne(cli, cli.compressor)
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

export { run };
