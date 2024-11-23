/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import {
    buildArgs,
    getFilesizeGzippedInBytes,
    getFilesizeInBytes,
    prettyBytes,
    readFile,
    setFileNameMin,
    writeFile,
} from "../src/index.ts";

const fixtureFile = `${__dirname}/../../../tests/fixtures/fixture-content.js`;

describe("Package: utils", () => {
    describe("readFile", () => {
        test("should return the content", () =>
            expect(readFile(fixtureFile)).toMatch("console.log('content');"));
    });

    describe("writeFile", () => {
        test("should return the content", () =>
            expect(
                writeFile({
                    file: `${__dirname}/../../../tests/tmp/temp.js`,
                    content: "const foo = 'bar';",
                })
            ).toBe("const foo = 'bar';"));
    });

    describe("buildArgs", () => {
        test("should return an array with args", () =>
            expect(
                buildArgs({
                    foo: "bar",
                })
            ).toEqual(["--foo", "bar"]));
    });

    describe("getFilesizeInBytes", () => {
        test("should return file size", () =>
            expect(getFilesizeInBytes(fixtureFile)).toMatch(/(24 B)|(25 B)/));
    });

    describe("getFilesizeGzippedInBytes", () => {
        test("should return file size", (): Promise<void> =>
            new Promise<void>((done) => {
                getFilesizeGzippedInBytes(fixtureFile).then((size) => {
                    expect(size).toMatch(/(44 B)|(45 B)/);
                    done();
                });
            }));
    });

    describe("pretty bytes", () => {
        test("should throw when not a number", () => {
            // @ts-expect-error
            expect(() => prettyBytes("a")).toThrow();
        });

        test("should return a negative number", () =>
            expect(prettyBytes(-1)).toBe("-1 B"));

        test("should return 0", () => expect(prettyBytes(0)).toBe("0 B"));
    });

    describe("setFileNameMin", () => {
        test("should return file name min", () =>
            expect(setFileNameMin("foo.js", "$1.min.js")).toBe("foo.min.js"));
    });
});
