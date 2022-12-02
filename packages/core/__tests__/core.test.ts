/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import childProcess from 'child_process';
import minify from '../src';
import gcc from '../../google-closure-compiler/src';
import noCompress from '../../no-compress/src';
import yui from '../../yui/src';
import uglifyes from '../../uglify-es/src';
import htmlMinifier from '../../html-minifier/src';
import { filesJS } from '../../../tests/files-path';
import { runOneTest, tests } from '../../../tests/fixtures';
import { TESTS_TIMEOUT } from '../../../constants';

const compressorLabel = 'uglify-es';
const compressor = uglifyes;

describe('Package: core', () => {
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor });
  });
  tests.commonjs.forEach(options => {
    runOneTest({ options, compressorLabel, compressor, sync: true });
  });
  describe('Fake binary', () => {
    test('should throw an error if binary does not exist', () => {
      const options = {};
      options.minify = {
        compressor: 'fake',
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual(
          'Error: compressor should be a function, maybe you forgot to install the compressor'
        );
      });
    });
  });

  describe('No mandatories', () => {
    test('should throw an error if no compressor', () => {
      const options = {};
      options.minify = {
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });

    test('should throw an error if no input', () => {
      const options = {};
      options.minify = {
        compressor: noCompress,
        output: filesJS.fileJSOut
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: input is mandatory.');
      });
    });

    test('should throw an error if no output', () => {
      const options = {};
      options.minify = {
        compressor: noCompress,
        input: filesJS.oneFileWithWildcards
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: output is mandatory.');
      });
    });
  });

  describe(
    'Create errors',
    () => {
      test('should catch an error if yui with bad options', () => {
        const options = {};
        options.minify = {
          compressor: yui,
          type: 'js',
          input: filesJS.oneFile,
          output: filesJS.fileJSOut,
          options: {
            fake: true
          }
        };
        return minify(options.minify).catch(err => {
          return expect(err.toString()).toMatch('Error');
        });
      });
      test('should catch an error if yui with bad options and sync', () => {
        const options = {};
        options.minify = {
          compressor: yui,
          type: 'js',
          input: filesJS.oneFile,
          output: filesJS.fileJSOut,
          sync: true,
          options: {
            fake: true
          }
        };
        return minify(options.minify).catch(err => {
          return expect(err.toString()).toMatch('Error');
        });
      });
    },
    TESTS_TIMEOUT
  );

  describe(
    'Create sync errors',
    () => {
      beforeAll(() => {
        let spy = vi.spyOn(childProcess, 'spawnSync');
        spy.mockImplementation(() => {
          throw new Error();
        });
      });
      test('should callback an error on spawnSync', () => {
        const options = {};
        options.minify = {
          compressor: yui,
          input: filesJS.oneFile,
          output: filesJS.fileJSOut,
          sync: true,
          options: {
            fake: true
          }
        };
        return expect(minify(options.minify)).rejects.toThrow();
      });
      afterAll(() => {
        vi.restoreAllMocks();
      });
    },
    TESTS_TIMEOUT
  );

  describe(
    'Create async errors',
    () => {
      beforeAll(() => {
        let spy = vi.spyOn(childProcess, 'spawn');
        spy.mockImplementation(() => {
          throw new Error();
        });
      });
      test('should callback an error on spawn', () =>
        new Promise(done => {
          const options = {};
          options.minify = {
            compressor: yui,
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            sync: false,
            options: {
              fake: true
            },
            callback: () => {}
          };
          const spy = vi.spyOn(options.minify, 'callback');
          expect(minify(options.minify)).rejects.toThrow();
          done();
          return minify(options.minify).catch(() => expect(spy).toHaveBeenCalled());
        }));
      afterAll(() => {
        vi.restoreAllMocks();
      });
    },
    TESTS_TIMEOUT
  );

  describe('Mandatory', () => {
    test('should show throw on type option', () => {
      const options = {};
      options.minify = {
        type: 'uglifyjs',
        input: filesJS.oneFileWithWildcards,
        output: filesJS.fileJSOut,
        callback: () => {}
      };

      return minify(options.minify).catch(err => {
        return expect(err.toString()).toEqual('Error: compressor is mandatory.');
      });
    });
  });

  describe(
    'Should be OK',
    () => {
      test('should be OK with GCC and async', () =>
        new Promise(done => {
          const options = {};
          options.minify = {
            compressor: gcc,
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            callback: () => {}
          };
          const spy = vi.spyOn(options.minify, 'callback');
          return minify(options.minify).then(min => {
            expect(spy).toHaveBeenCalled();
            done();
            return expect(min).toBeDefined();
          });
        }));
      test('should be OK with GCC and sync', () =>
        new Promise(done => {
          const options = {};
          options.minify = {
            compressor: gcc,
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            sync: true,
            callback: () => {
              done();
            }
          };
          const spy = vi.spyOn(options.minify, 'callback');
          return minify(options.minify).then(min => {
            expect(spy).toHaveBeenCalled();
            return expect(min).toBeDefined();
          });
        }));
    },
    TESTS_TIMEOUT
  );

  describe(
    'In Memory',
    () => {
      test('should be OK with html minifier and async', () =>
        new Promise(done => {
          const options = {};
          options.minify = {
            compressor: htmlMinifier,
            content: '<html><body><div>content</div></body></html>',
            callback: () => {}
          };
          const spy = vi.spyOn(options.minify, 'callback');

          return minify(options.minify).then(min => {
            expect(spy).toHaveBeenCalled();
            done();
            return expect(min).toBeDefined();
          });
        }));

      test('should be OK with GCC and sync', () =>
        new Promise(done => {
          const options = {};
          options.minify = {
            compressor: htmlMinifier,
            content: '<html><body><div>content</div></body></html>',
            sync: true,
            callback: () => {}
          };
          const spy = vi.spyOn(options.minify, 'callback');

          return minify(options.minify).then(min => {
            done();
            expect(spy).toHaveBeenCalled();
            return expect(min).toBeDefined();
          });
        }));

      test('should throw an error if binary does not exist', () => {
        const options = {};
        options.minify = {
          compressor: 'fake',
          content: '<html><body><div>content</div></body></html>'
        };

        return minify(options.minify).catch(err => {
          return expect(err.toString()).toEqual(
            'Error: compressor should be a function, maybe you forgot to install the compressor'
          );
        });
      });
    },
    TESTS_TIMEOUT
  );
});
