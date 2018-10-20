#!/usr/bin/env node

/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

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
  .option('-s, --silence', 'no output will be printed')
  .option('-O, --option [option]', 'option for the compressor as JSON object', '');

program.on('--help', function() {
  console.log('  List of compressors:');
  console.log('');
  console.log('    - babel-minify');
  console.log('    - butternut');
  console.log('    - gcc');
  console.log('    - html-minifier');
  console.log('    - terser');
  console.log('    - uglifyjs');
  console.log('    - uglify-es');
  console.log('    - yui');
  console.log('');
});

program.parse(process.argv);

var options = program.opts();

/**
 * Show help if missing mandatory.
 */

if (!options.compressor || !options.input || !options.output) {
  program.help();
}

cli(options).catch(function(err) {
  console.error(err);
  process.exit(1);
});
