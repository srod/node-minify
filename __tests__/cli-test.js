'use strict';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

var childProcess = require('child_process');
var nodeMinify = require('../lib/node-minify');
var cli = require('../lib/cli');
var utils = require('../lib/utils');

describe('cli', function() {
  test('should minify to have been called', function() {
    var spy = jest.spyOn(nodeMinify, 'minify');
    cli({
      compressor: 'gcc',
      input: 'examples/public/js/sample.js',
      output: 'examples/public/js-dist/babili-es6.js'
    });
    expect(spy).toHaveBeenCalled();
  });
  test('should minify to have been called with all compressors', function() {
    var spy = jest.spyOn(nodeMinify, 'minify');
    return cli({
      compressor: 'all',
      input: 'examples/public/js/sample.js',
      output: 'examples/public/js-dist/babili-es6.js'
    }).then(function() {
      expect(spy).toHaveBeenCalled();
    });
  });
});

describe('cli error', function() {
  beforeEach(function() {
    spyOn(childProcess, 'spawn').and.throwError('UnsupportedClassVersionError');
  });
  test('should minify to throw with all compressors', function() {
    var spy = jest.spyOn(nodeMinify, 'minify');
    return cli({
      compressor: 'all',
      input: 'examples/public/js/sample.js',
      output: 'examples/public/js-dist/babili-es6.js'
    }).catch(function(err) {
      expect(spy).toHaveBeenCalled();
      return expect(err.message).toMatch(
        /(UnsupportedClassVersionError)|(Latest Google Closure Compiler requires Java >= 1.7, please update Java or use gcc-legacy)/
      );
    });
  });
});

describe('pretty bytes', function() {
  test('should throw when not a number', function() {
    expect(function() {
      utils.prettyBytes('a');
    }).toThrow();
  });

  test('should return a negative number', function() {
    expect(utils.prettyBytes(-1)).toBe('-1 B');
  });

  test('should return 0', function() {
    expect(utils.prettyBytes(0)).toBe('0 B');
  });
});
