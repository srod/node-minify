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
var table = require('text-table');
var compress = require('./compress');
var spinner = require('./spinner');
var cliOptions;

/**
 * Module variables.
 */

var all = ['babel-minify', 'butternut', 'gcc', 'uglifyjs', 'yui'];

/**
 * Last step after minify.
 */

function finalize(results, smallers) {
  if (results.length - 1 === all.length) {
    var _table = table(results);

    console.log('');
    console.log(chalk.bgBlue.black(' INFO '), 'Result');
    console.log('');
    console.log(_table);
    console.log('');
    console.log(chalk.bgBlue.black(' INFO '), formatSmallers(smallers));

    console.log('\nCompressing with ' + chalk.green(smallers[0].compressor) + ' to ' + chalk.yellow(cliOptions.output));
    runOne(cliOptions, smallers[0].compressor, results, smallers).then(function() {
      console.log('');
      console.log(chalk.bgGreen.black(' DONE '), chalk.green('All done!'));
      console.log('');
    });
  }
}

/**
 * Format the output.
 */

function formatSmallers(smallers) {
  var sizeGzip = 0;
  var output = 'The smallest ' + (smallers.length > 1 ? 'are' : 'is') + ': ';
  smallers.forEach(function(item) {
    output += chalk.green(item.compressor) + ' ';
    sizeGzip = chalk.green(item.sizeGzip);
  });
  output += 'with ' + sizeGzip;
  return output;
}

/**
 * Set the smallers compressor result.
 */

function setSmaller(result, smallers) {
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
}

/**
 * Run one compressor.
 */

function runOne(cli, compressor, results, smallers) {
  return new Promise(function(resolve, reject) {
    var options = {
      compressor: compressor || cli.compressor,
      input: cli.input.split(','),
      output: cli.output
    };

    spinner.start(compressor || cli.compressor);

    return compress(options)
      .then(function(result) {
        results.push([result.compressor, result.size, result.sizeGzip]);
        setSmaller(result, smallers);
        spinner.stop(compressor);
        resolve();
      })
      .catch(function(err) {
        spinner.error(compressor);
        reject(err);
      });
  });
}

/**
 * Run cli.
 */

function run(cli) {
  var results = [['Compressor', 'Size minified', 'Size Gzipped']];
  var smallers = [{ sizeGzip: undefined }];
  cliOptions = cli;

  console.log('');
  console.log(chalk.bgBlue.black(' INFO '), 'Starting compression...');
  console.log('');

  return new Promise(function(resolve, reject) {
    if (cli.compressor === 'all') {
      var sequence = Promise.resolve();
      all.forEach(function(compressor) {
        sequence = sequence.then(function() {
          return runOne(cli, compressor, results, smallers);
        });
      });
      sequence
        .then(function() {
          finalize(results, smallers);
          resolve();
        })
        .catch(reject);
      return sequence;
    } else {
      runOne(cli, cli.compressor, results, smallers)
        .then(function() {
          console.log('');
          console.log(chalk.bgGreen.black(' DONE '), chalk.green('Done!'));
          console.log('');
        })
        .then(resolve)
        .catch(reject);
    }
  });
}

module.exports = run;
