/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import compilerPath from 'google-closure-compiler-java';
import { utils } from '@node-minify/utils';
import { runCommandLine } from '@node-minify/run';
import { MinifierOptions, Options, Dictionary } from '@node-minify/types';

// interface Options2 {
//   [Key: string]: string;
// }

// interface Settings {
//   options: Options;
//   content: string;
//   output: string;
//   sync: boolean;
//   buffer: number;
// }

// interface MinifierOptions {
//   settings: Settings;
//   content: string;
//   callback: Function;
//   index: number;
// }

// the allowed flags, taken from https://github.com/google/closure-compiler/wiki/Flags-and-Options
const allowedFlags = [
  'angular_pass',
  'assume_function_wrapper',
  'checks_only',
  'compilation_level',
  'create_source_map',
  'define',
  'env',
  'externs',
  'export_local_property_definitions',
  'generate_exports',
  'language_in',
  'language_out',
  'output_wrapper',
  'polymer_version',
  'process_common_js_modules',
  'rename_prefix_namespace',
  'rewrite_polyfills',
  'use_types_for_optimization',
  'warning_level'
];

/**
 * Run Google Closure Compiler.
 *
 * @param {Object} settings
 * @param {String} content
 * @param {Function} callback
 */
const minifyGCC = ({ settings, content, callback, index }: MinifierOptions) => {
  const options = applyOptions({}, (settings && settings.options) || {});
  return runCommandLine({
    args: gccCommand(options),
    data: content,
    settings,
    callback: (err: Error, content: string) => {
      if (err) {
        if (callback) {
          return callback(err);
        } else {
          throw err;
        }
      }
      if (settings && !settings.content) {
        utils.writeFile({ file: settings.output, content, index });
      }
      if (callback) {
        return callback(null, content);
      }
      return content;
    }
  });
};

// interface Dictionary<T> {
//   [Key: string]: T;
// }

/**
 * Adds any valid options passed in the options parameters to the flags parameter and returns the flags object.
 * @param {Object} flags
 * @param {Object} options
 * @returns {Object} flags
 */
const applyOptions = (flags: Dictionary<string>, options: Options) => {
  if (!options || Object.keys(options).length === 0) {
    return flags;
  }
  Object.keys(options)
    .filter(option => allowedFlags.indexOf(option) > -1)
    .forEach(option => (flags[option] = options[option]));
  return flags;
};

/**
 * GCC command line.
 */

const gccCommand = (options: {}) => {
  return ['-jar', compilerPath].concat(utils.buildArgs(options || {}));
};

/**
 * Expose `minifyGCC()`.
 */
export default minifyGCC;
