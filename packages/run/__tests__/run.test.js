/*!
 * node-minify
 * Copyright(c) 2011-2020 Rodolphe Stoclin
 * MIT Licensed
 */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import childProcess from 'child_process';
import { runCommandLine } from '../src/run';

const jar = `${__dirname}/../../yui/src/binaries/yuicompressor-2.4.7.jar`;

describe('Package: run', () => {
  describe('Base', () => {
    test('should be OK with YUI and async', done => {
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
      const spy = jest.spyOn(command, 'callback');
      runCommandLine(command);
    });

    test('should not be OK with YUI and sync, fake arg', done => {
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
      const spy = jest.spyOn(command, 'callback');
      runCommandLine(command);
    });

    test('should be OK with YUI and sync', () => {
      const command = {
        args: ['-jar', '-Xss2048k', jar, '--type', 'js'],
        data: 'console.log("foo");',
        settings: {
          sync: true
        },
        callback: () => {
          expect(spy).toHaveBeenCalled();
        }
      };
      const spy = jest.spyOn(command, 'callback');
      runCommandLine(command);
    });

    test('should not be OK with YUI and sync, fake arg', () => {
      const command = {
        args: ['-jar', '-Xss2048k', jar, '--type', 'js', '--fake'],
        data: 'console.log("foo");',
        settings: {
          sync: true
        },
        callback: () => {
          expect(spy).toHaveBeenCalled();
        }
      };
      const spy = jest.spyOn(command, 'callback');
      runCommandLine(command);
    });
  });

  describe('Create sync errors', () => {
    beforeEach(() => {
      spyOn(childProcess, 'spawnSync').and.throwError('UnsupportedClassVersionError');
    });
    test('should not be OK with YUI and sync', () => {
      const command = {
        args: ['-jar', '-Xss2048k', 'foo.jar', '--type', 'js', '--fake'],
        data: 'console.log("foo");',
        settings: {
          sync: true
        },
        callback: () => {
          expect(spy).toHaveBeenCalled();
        }
      };
      const spy = jest.spyOn(command, 'callback');
      runCommandLine(command);
    });
  });
});
