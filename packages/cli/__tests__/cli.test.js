/*!
 * node-minify
 * Copyright(c) 2011-2021 Rodolphe Stoclin
 * MIT Licensed
 */

jest.setTimeout(30000);

import childProcess from 'child_process';
import * as cli from '../src/cli';
import { filesJS } from '../../../tests/files-path';

describe('Package: cli', () => {
  test('should minify to have been called with gcc', () => {
    const spy = jest.spyOn(cli, 'run');
    return cli
      .run({
        compressor: 'google-closure-compiler',
        input: filesJS.oneFile,
        output: filesJS.fileJSOut,
        option: '{"createSourceMap": true}'
      })
      .then(() => expect(spy).toHaveBeenCalled());
  });
});

describe('cli error', () => {
  beforeAll(() => {
    let spy = jest.spyOn(childProcess, 'spawn');
    spy.mockImplementation(() => {
      throw new Error();
    });
  });
  test('should minify to throw with yui error', () => {
    const spy = jest.spyOn(cli, 'run');
    const options = {
      compressor: 'yui',
      input: filesJS.oneFile,
      output: filesJS.fileJSOut
    };
    expect(cli.run(options)).rejects.toThrow();
    return cli.run(options).catch(() => expect(spy).toHaveBeenCalled());
  });
  afterAll(() => {
    jest.restoreAllMocks();
  });
});
