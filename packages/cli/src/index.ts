/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import chalk from 'chalk';
import { compress } from './compress';
import { spinnerStart, spinnerStop, spinnerError } from './spinner';
import { Settings, Result } from '@node-minify/types';

/**
 * Module variables.
 */
let silence = false;

/**
 * Run one compressor.
 */
const runOne = async (cli: Settings) => {
  /* eslint-disable  @typescript-eslint/no-var-requires */
  const compressor =
    typeof cli.compressor === 'string' ? await import(`@node-minify/${cli.compressor}`) : cli.compressor;
  /* eslint-enable  @typescript-eslint/no-var-requires */

  const compressorName =
    typeof cli.compressor === 'string' ? cli.compressor : cli.compressor ? cli.compressor.name : 'unknownCompressor';

  const options: Settings = {
    compressorLabel: compressorName,
    compressor: compressor.default,
    input: typeof cli.input === 'string' ? cli.input.split(',') : '',
    output: cli.output
  };

  if (cli.option) {
    options.options = JSON.parse(cli.option);
  }

  if (!silence) {
    spinnerStart(options);
  }

  return compress(options)
    .then((result: Result) => {
      if (!silence) {
        spinnerStop(result);
      }
      return result;
    })
    .catch((err: Error) => {
      if (!silence) {
        spinnerError(options);
      }
      throw err;
    });
};

/**
 * Run cli.
 */
const run = (cli: Settings) => {
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
