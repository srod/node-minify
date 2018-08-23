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
var deprecate = require('depd')('node-minify');
var compress = require('./compress');
var spinner = require('./spinner');
var silence = false;

/**
 * Run one compressor.
 */

function runOne(cli, compressor) {
  return new Promise(function(resolve, reject) {
    var options = {
      compressor: compressor || cli.compressor,
      input: cli.input.split(','),
      output: cli.output
    };

    if (cli.option) {
      options.options = JSON.parse(cli.option);
    }

    if (!silence) {
      spinner.start(options);
    }

    return compress(options)
      .then(function(result) {
        if (!silence) {
          spinner.stop(result);
        }
        resolve(result);
      })
      .catch(function(err) {
        if (!silence) {
          spinner.error(options);
        }
        reject(err);
      });
  });
}

/**
 * Run cli.
 */

function run(cli) {
  silence = !!cli.silence;

  if (!silence) {
    console.log('');
    console.log(chalk.bgBlue.black(' INFO '), 'Starting compression...');
    console.log('');
  }

  return new Promise(function(resolve, reject) {
    if (cli.compressor === 'all') {
      deprecate('all is deprecated, babel-minify will be used by default');
      console.log('');
      cli.compressor = 'babel-minify';
    }

    runOne(cli, cli.compressor)
      .then(function() {
        if (!silence) {
          console.log('');
          console.log(chalk.bgGreen.black(' DONE '), chalk.green('Done!'));
          console.log('');
        }
      })
      .then(resolve)
      .catch(reject);
  });
}

module.exports = run;
