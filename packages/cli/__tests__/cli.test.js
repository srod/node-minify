/*!
 * node-minify
 * Copyright(c) 2011-2018 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from 'child_process';
import * as cli from '../lib/cli';
import gcc from '@node-minify/google-closure-compiler';
import yui from '@node-minify/yui';
import { filesJS } from '../../../tests/files-path';

describe('cli', () => {
  test('should minify to have been called with gcc', () => {
    const spy = jest.spyOn(cli, 'run');
    return cli
      .run({
        compressor: gcc,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        option: '{"createSourceMap": true}'
      })
      .then(() => expect(spy).toHaveBeenCalled());
  });
});

describe('cli error', () => {
  beforeEach(() => spyOn(childProcess, 'spawn').and.throwError('UnsupportedClassVersionError'));
  test('should minify to throw with yui error', () => {
    const spy = jest.spyOn(cli, 'run');
    return cli
      .run({
        compressor: yui,
        input: filesJS.oneFile,
        output: filesJS.fileJSOut
      })
      .catch(err => {
        expect(spy).toHaveBeenCalled();
        return expect(err.message).toMatch(/(UnsupportedClassVersionError)/);
      });
  });
});
