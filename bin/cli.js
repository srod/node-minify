#!/usr/bin/env node

var updateNotifier = require('update-notifier');
var program = require('commander');
var cli = require('../lib/cli');
var pkg = require('../package.json');

updateNotifier({ pkg: pkg }).notify();

program
  .version(pkg.version, '-v, --version')
  .option('-c, --compressor [compressor]', 'use the specified compressor [uglifyjs]', 'uglifyjs')
  .option('-i, --input [file]', 'input file path')
  .option('-o, --output [file]', 'output file path')
  .parse(process.argv);

var options = program.opts();

/**
 * Show help if missing mandatory.
 */

if (!options.compressor || !options.input || !options.output) {
  program.help();
}

cli(options).catch(function(err) {
  console.error(err);
});
