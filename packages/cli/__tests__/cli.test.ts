/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import childProcess from 'child_process';
import { Settings } from '@node-minify/types';
import * as cli from '../src';
import { filesJS } from '../../../tests/files-path';
import { TESTS_TIMEOUT } from '../../../tests/constants';

describe(
  'Package: cli',
  () => {
    test('should minify to have been called with gcc', () => {
      const spy = vi.spyOn(cli, 'run');
      return cli
        .run({
          compressor: 'google-closure-compiler',
          input: filesJS.oneFile,
          output: filesJS.fileJSOut,
          option: '{"createSourceMap": true}'
        })
        .then(() => expect(spy).toHaveBeenCalled());
    });
  },
  TESTS_TIMEOUT
);

describe(
  'cli error',
  () => {
    beforeAll(() => {
      const spy = vi.spyOn(childProcess, 'spawn');
      spy.mockImplementation(() => {
        throw new Error();
      });
    });
    test('should minify to throw with yui error', () => {
      const spy = vi.spyOn(cli, 'run');
      const options: Settings = {
        compressor: 'yui',
        input: filesJS.oneFile,
        output: filesJS.fileJSOut
      };
      expect(cli.run(options)).rejects.toThrow();
      return cli.run(options).catch(() => expect(spy).toHaveBeenCalled());
    });
    afterAll(() => {
      vi.restoreAllMocks();
    });
  },
  TESTS_TIMEOUT
);
