/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import chalk from 'chalk';
import { compress } from './compress';
import { spinnerStart, spinnerStop, spinnerError } from './spinner';
import { Settings, Result } from '@node-minify/types';

// export interface Options {
//   compressorLabel: string | Function;
//   compressor: Function;
//   input: string | string[];
//   output: string;
//   options?: string;
// }

// interface Option {}

// interface Cli {
//   compressor: string | Function;
//   input: string;
//   output: string;
//   // option: Options;
//   option: string;
//   silence?: boolean;
// }

// export interface Result {
//   compressor?: string | Function;
//   compressorLabel: string | Function;
//   size: number;
//   sizeGzip: number;
// }

/**
 * Module variables.
 */
let silence = false;

/**
 * Run one compressor.
 */
const runOne = (cli: Settings): Promise<Result> => {
  return new Promise<Result>((resolve, reject) => {
    const compressor =
      typeof cli.compressor === 'string' ? require(`@node-minify/${cli.compressor}`).default : cli.compressor;

    const options: Settings = {
      compressorLabel: cli.compressor,
      compressor,
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
        resolve(result);
      })
      .catch((err: Error) => {
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
