/*!
 * node-minify
 * Copyright(c) 2011-2022 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import childProcess from 'child_process';
import { runCommandLine } from '../src';
import { TESTS_TIMEOUT } from '../../../constants';

const jar = `${__dirname}/../../yui/src/binaries/yuicompressor-2.4.7.jar`;

describe('Package: run', () => {
  describe(
    'Base',
    () => {
      test('should be OK with YUI and async', () =>
        new Promise(done => {
          const command = {
            args: ['-jar', '-Xss2048k', jar, '--type', 'js'],
            data: 'console.log("foo");',
            settings: {
              sync: false
            },
            callback: (err, min) => {
              expect(spy).toHaveBeenCalled();
              expect(err).toBeNull();
              expect(min).toBeDefined();
              done();
            }
          };
          const spy = vi.spyOn(command, 'callback');
          runCommandLine(command);
        }));
      test('should not be OK with YUI and sync, fake arg', () =>
        new Promise(done => {
          const command = {
            args: ['-jar', '-Xss2048k', jar, '--type', 'js', '--fake'],
            data: 'console.log("foo");',
            settings: {
              sync: false
            },
            callback: (err, min) => {
              expect(spy).toHaveBeenCalled();
              expect(err).toBeDefined();
              expect(min).toBeUndefined();
              done();
            }
          };
          const spy = vi.spyOn(command, 'callback');
          runCommandLine(command);
        }));
      test('should be OK with YUI and sync', () =>
        new Promise(done => {
          const command = {
            args: ['-jar', '-Xss2048k', jar, '--type', 'js'],
            data: 'console.log("foo");',
            settings: {
              sync: true
            },
            callback: () => {
              expect(spy).toHaveBeenCalled();
              done();
            }
          };
          const spy = vi.spyOn(command, 'callback');
          runCommandLine(command);
        }));
      test('should not be OK with YUI and sync, fake arg', () =>
        new Promise(done => {
          const command = {
            args: ['-jar', '-Xss2048k', jar, '--type', 'js', '--fake'],
            data: 'console.log("foo");',
            settings: {
              sync: true
            },
            callback: () => {
              expect(spy).toHaveBeenCalled();
              done();
            }
          };
          const spy = vi.spyOn(command, 'callback');
          runCommandLine(command);
        }));
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
      test('should not be OK with YUI and sync', () =>
        new Promise(done => {
          const command = {
            args: ['-jar', '-Xss2048k', 'foo.jar', '--type', 'js', '--fake'],
            data: 'console.log("foo");',
            settings: {
              sync: true
            },
            callback: () => {
              expect(spy).toHaveBeenCalled();
              done();
            }
          };
          const spy = vi.spyOn(command, 'callback');
          runCommandLine(command);
        }));
    },
    TESTS_TIMEOUT
  );
  afterAll(() => {
    vi.restoreAllMocks();
  });
});
