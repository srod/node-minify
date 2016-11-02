/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

import chalk from 'chalk';
import table from 'text-table';
import { compress } from './compress';
import { spinnerStart, spinnerStop, spinnerError } from './spinner';

/**
 * Module variables.
 */

const all = ['babel-minify', 'butternut', 'gcc', 'uglifyjs', 'yui'];
let cliOptions;
let selectedCompressors;

/**
 * Last step after minify.
 */

const finalize = (results, smallers) => {
  if (results.length - 1 === selectedCompressors.length) {
    const _table = table(results);

    console.log('');
    console.log(chalk.bgBlue.black(' INFO '), 'Result');
    console.log('');
    console.log(_table);
    console.log('');
    console.log(chalk.bgBlue.black(' INFO '), formatSmallers(smallers));

    console.log('\nCompressing with ' + chalk.green(smallers[0].compressor) + ' to ' + chalk.yellow(cliOptions.output));
    runOne(cliOptions, smallers[0].compressor, results, smallers).then(() => {
      console.log('');
      console.log(chalk.bgGreen.black(' DONE '), chalk.green('All done!'));
      console.log('');
    });
  }
};

/**
 * Format the output.
 */

const formatSmallers = smallers => {
  let sizeGzip = 0;
  let output = 'The smallest ' + (smallers.length > 1 ? 'are' : 'is') + ': ';
  smallers.forEach(item => {
    output += chalk.green(item.compressor) + ' ';
    sizeGzip = chalk.green(item.sizeGzip);
  });
  output += 'with ' + sizeGzip;
  return output;
};

/**
 * Set the smallers compressor result.
 */

const setSmaller = (result, smallers) => {
  if (!smallers[0].sizeGzip) {
    smallers[0] = result;
    return;
  }
  if (smallers[0].sizeGzip > result.sizeGzip) {
    smallers = [];
    smallers[0] = result;
    return;
  }
  if (smallers[0].sizeGzip === result.sizeGzip) {
    smallers.push(result);
  }
};

/**
 * Run one compressor.
 */

const runOne = (cli, compressor, results, smallers) => {
  return new Promise((resolve, reject) => {
    const options = {
      compressor: compressor || cli.compressor,
      input: cli.input.split(','),
      output: cli.output
    };

    spinnerStart(compressor || cli.compressor);

    return compress(options)
      .then(result => {
        results.push([result.compressor, result.size, result.sizeGzip]);
        setSmaller(result, smallers);
        spinnerStop(compressor);
        resolve();
      })
      .catch(err => {
        spinnerError(compressor);
        reject(err);
      });
  });
};

/**
 * Run cli.
 */

const run = cli => {
  const results = [['Compressor', 'Size minified', 'Size Gzipped']];
  const smallers = [{ sizeGzip: undefined }];
  cliOptions = cli;

  console.log('');
  console.log(chalk.bgBlue.black(' INFO '), 'Starting compression...');
  console.log('');

  return new Promise((resolve, reject) => {
    if (cli.compressor === 'all') {
      selectedCompressors = all;
    } else {
      selectedCompressors = cli.compressor.split(',');
      selectedCompressors = selectedCompressors.map(item => item.trim().toLowerCase());
    }

    const isMultipleCompressors = selectedCompressors.length > 1;

    if (isMultipleCompressors) {
      let sequence = Promise.resolve();
      selectedCompressors.forEach(compressor => {
        sequence = sequence.then(() => {
          return runOne(cli, compressor, results, smallers);
        });
      });
      sequence
        .then(() => {
          finalize(results, smallers);
          resolve();
        })
        .catch(reject);
      return sequence;
    } else {
      runOne(cli, cli.compressor, results, smallers)
        .then(() => {
          console.log('');
          console.log(chalk.bgGreen.black(' DONE '), chalk.green('Done!'));
          console.log('');
        })
        .then(resolve)
        .catch(reject);
    }
  });
};

export { run };
