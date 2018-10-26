import { utils } from '../lib/utils';

const fixtureFile = __dirname + '/../../../tests/fixtures/fixture-content.js';

describe('utils', () => {
  describe('readFile', () => {
    test('should return the content', () => expect(utils.readFile(fixtureFile)).toBe("console.log('content');\n"));
  });

  describe('writeFile', () => {
    test('should return the content', () =>
      expect(utils.writeFile({ file: __dirname + '/../../../tests/tmp/temp.js', content: "const foo = 'bar';" })).toBe(
        "const foo = 'bar';"
      ));
  });

  describe('buildArgs', () => {
    test('should return an array with args', () =>
      expect(
        utils.buildArgs({
          foo: 'bar'
        })
      ).toEqual(['--foo', 'bar']));
  });

  describe('clone', () => {
    const obj = { foo: 'bar' };
    test('should return the same object', () => expect(utils.clone(obj)).toEqual(obj));
  });

  describe('getFilesizeInBytes', () => {
    test('should return file size', () => expect(utils.getFilesizeInBytes(fixtureFile)).toBe('24 B'));
  });

  describe('getFilesizeGzippedInBytes', () => {
    test('should return file size', done => {
      utils.getFilesizeGzippedInBytes(fixtureFile).then(size => {
        expect(size).toBe('44 B');
        done();
      });
    });
  });

  describe('pretty bytes', () => {
    test('should throw when not a number', () => {
      expect(() => utils.prettyBytes('a')).toThrow();
    });

    test('should return a negative number', () => expect(utils.prettyBytes(-1)).toBe('-1 B'));

    test('should return 0', () => expect(utils.prettyBytes(0)).toBe('0 B'));
  });

  describe('setFileNameMin', () => {
    test('should return file name min', () => expect(utils.setFileNameMin('foo.js', '$1.min.js')).toBe('foo.min.js'));
  });
});
