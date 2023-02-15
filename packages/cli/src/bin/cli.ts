#!/usr/bin/env node

/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

import updateNotifier from 'update-notifier';
import { Command } from 'commander';
const program = new Command();
import { run } from '../';
import packageJson from '../../package.json';
import { Settings } from '@node-minify/types';

updateNotifier({ pkg: packageJson }).notify();

program
  .storeOptionsAsProperties()
  .version(packageJson.version, '-v, --version')
  .option('-c, --compressor [compressor]', 'use the specified compressor [uglify-js]', 'uglify-js')
  .option('-i, --input [file]', 'input file path')
  .option('-o, --output [file]', 'output file path')
  .option('-s, --silence', 'no output will be printed')
  .option('-O, --option [option]', 'option for the compressor as JSON object', '');

program.on('--help', function () {
  console.log('  List of compressors:');
  console.log('');
  console.log('    - babel-minify');
  console.log('    - gcc');
  console.log('    - html-minifier');
  console.log('    - terser');
  console.log('    - uglify-js');
  console.log('    - uglify-es');
  console.log('    - yui');
  console.log('');
});

program.parse(process.argv);

const options: Settings = program.opts();

/**
 * Show help if missing mandatory.
 */
if (!options.compressor || !options.input || !options.output) {
  program.help();
}

run(options)
  .then(() => process.exit())
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
