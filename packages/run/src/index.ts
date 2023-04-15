/*!
 * node-minify
 * Copyright(c) 2011-2023 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import childProcess from 'child_process';
import { MinifierOptions } from '@node-minify/types';

/**
 * Run the command line with spawn.
 *
 * @param {Array} args
 * @param {String} data
 * @param {Object} settings
 * @param {Function} callback
 */
const runCommandLine = ({ args, data, settings, callback }: MinifierOptions) => {
  if (settings?.sync) {
    return runSync({ settings, data, args, callback });
  }

  return runAsync({ data, args, callback });
};

/**
 * Exec command as async.
 *
 * @param {String} data
 * @param {Array} args
 * @param {Function} callback
 */
const runAsync = ({ data, args, callback }: MinifierOptions) => {
  let stdout = '';
  let stderr = '';

  const child = childProcess.spawn('java', args, {
    stdio: 'pipe'
  });

  child.on('error', console.log.bind(console, 'child'));
  child.stdin.on('error', console.log.bind(console, 'child.stdin'));
  child.stdout.on('error', console.log.bind(console, 'child.stdout'));
  child.stderr.on('error', console.log.bind(console, 'child.stderr'));

  child.on('exit', code => {
    if (code !== 0) {
      return callback?.(new Error(stderr));
    }

    return callback?.(null, stdout);
  });

  child.stdout.on('data', chunk => {
    stdout += chunk;
  });
  child.stderr.on('data', chunk => {
    stderr += chunk;
  });

  child.stdin.end(data);
};

/**
 * Exec command as sync.
 *
 * @param {Object} settings
 * @param {String} data
 * @param {Array} args
 * @param {Function} callback
 */
const runSync = ({ settings, data, args, callback }: MinifierOptions) => {
  try {
    const child = childProcess.spawnSync('java', args, {
      input: data,
      stdio: 'pipe',
      maxBuffer: settings?.buffer
    });
    const stdout = child.stdout.toString();
    const stderr = child.stderr.toString();
    const code = child.status;

    if (code !== 0) {
      return callback?.(new Error(stderr));
    }

    return callback?.(null, stdout);
  } catch (err: unknown) {
    return callback?.(err);
  }
};

/**
 * Expose `runCommandLine()`.
 */
export { runCommandLine };
