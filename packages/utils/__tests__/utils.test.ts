/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { lstatSync, unlinkSync } from "node:fs";
import { describe, expect, test, vi } from "vitest";

vi.mock("node:fs", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:fs")>();
    return {
        ...actual,
        lstatSync: vi.fn(actual.lstatSync),
        unlinkSync: vi.fn(actual.unlinkSync),
    };
});

import { ValidationError } from "../src/error.ts";
import {
    buildArgs,
    compressSingleFile,
    deleteFile,
    getContentFromFiles,
    getFilesizeGzippedInBytes,
    getFilesizeInBytes,
    isValidFile,
    prettyBytes,
    readFile,
    run,
    setFileNameMin,
    writeFile,
} from "../src/index.ts";

const fixtureFile = `${__dirname}/../../../tests/fixtures/fixture-content.js`;

describe("Package: utils", () => {
    describe("readFile", () => {
        test("should return the content", () =>
            expect(readFile(fixtureFile)).toMatch("console.log('content');"));

        test("should throw an error if file does not exist", () => {
            expect(() => readFile("fake.js")).toThrow();
        });
    });

    describe("isValidFile", () => {
        test("should return true if file exists", () => {
            expect(isValidFile(fixtureFile)).toBe(true);
        });

        test("should return false if file does not exist", () => {
            expect(isValidFile("fake.js")).toBe(false);
        });

        test("should return false if it is a directory", () => {
            expect(isValidFile(__dirname)).toBe(false);
        });

        test("should throw FileOperationError if lstatSync fails", () => {
            vi.mocked(lstatSync).mockImplementationOnce(() => {
                throw new Error("FS error");
            });
            expect(() => isValidFile(fixtureFile)).toThrow();
        });
    });

    describe("run", () => {
        test("should run the compressor", async () => {
            const compressor = vi.fn().mockResolvedValue("minified");
            const result = await run({
                settings: { compressor } as any,
                content: "content",
            });
            expect(result).toBe("minified");
            expect(compressor).toHaveBeenCalledWith({
                settings: { compressor },
                content: "content",
                index: undefined,
            });
        });

        test("should throw if no settings", async () => {
            await expect(run({} as any)).rejects.toThrow(ValidationError);
        });

        test("should throw if no compressor", async () => {
            await expect(run({ settings: {} } as any)).rejects.toThrow(
                ValidationError
            );
        });
    });

    describe("deleteFile", () => {
        test("should delete a file", () => {
            const tempFile = `${__dirname}/../../../tests/tmp/delete-me.js`;
            writeFile({ file: tempFile, content: "content" });
            expect(isValidFile(tempFile)).toBe(true);
            deleteFile(tempFile);
            expect(isValidFile(tempFile)).toBe(false);
        });

        test("should throw if file does not exist", () => {
            expect(() => deleteFile("fake.js")).toThrow("File does not exist");
        });

        test("should throw FileOperationError if unlinkSync fails", () => {
            const tempFile = `${__dirname}/../../../tests/tmp/delete-fail.js`;
            writeFile({ file: tempFile, content: "content" });
            vi.mocked(unlinkSync).mockImplementationOnce(() => {
                throw new Error("Unlink failed");
            });
            expect(() => deleteFile(tempFile)).toThrow();
        });
    });

    describe("writeFile", () => {
        test("should return the content", () =>
            expect(
                writeFile({
                    file: `${__dirname}/../../../tests/tmp/temp.js`,
                    content: "const foo = 'bar';",
                })
            ).toBe("const foo = 'bar';"));

        test("should write content to an array of files", () => {
            const files: [string, string] = [
                `${__dirname}/../../../tests/tmp/temp1.js`,
                `${__dirname}/../../../tests/tmp/temp2.js`,
            ];
            expect(
                writeFile({
                    file: files,
                    content: "content",
                    index: 0,
                })
            ).toBe("content");
            expect(readFile(files[0])).toBe("content");
        });

        test("should throw if no target file", () => {
            expect(() => writeFile({ file: "", content: "content" })).toThrow(
                ValidationError
            );
        });

        test("should throw if no content", () => {
            expect(() => writeFile({ file: "foo.js", content: "" })).toThrow(
                ValidationError
            );
        });

        test("should throw if target path is a directory", () => {
            expect(() =>
                writeFile({
                    file: __dirname,
                    content: "content",
                })
            ).toThrow();
        });
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

        test("should return file name min with public folder", () =>
            expect(setFileNameMin("foo.js", "$1.min.js", "public/")).toBe(
                "public/foo.min.js"
            ));

        test("should return file name min in place", () =>
            expect(
                setFileNameMin("src/foo.js", "$1.min.js", undefined, true)
            ).toBe("src/foo.min.js"));

        test("should throw if no file", () => {
            expect(() => setFileNameMin("", "$1.min.js")).toThrow(
                ValidationError
            );
        });

        test("should throw if output does not contain $1", () => {
            expect(() => setFileNameMin("foo.js", "min.js")).toThrow(
                ValidationError
            );
        });

        test("should throw if file has no extension", () => {
            expect(() => setFileNameMin("foo", "$1.min.js")).toThrow(
                ValidationError
            );
        });
    });

    describe("getFilesizeGzippedInBytes", () => {
        test("should return file size", (): Promise<void> =>
            new Promise<void>((done) => {
                getFilesizeGzippedInBytes(fixtureFile).then((size) => {
                    expect(size).toMatch(/(44 B)|(45 B)/);
                    done();
                });
            }));

        test("should throw if file does not exist", async () => {
            await expect(
                getFilesizeGzippedInBytes("fake.js")
            ).rejects.toThrow();
        });

        test("should throw if path is a directory", async () => {
            const dirPath = __dirname || ".";
            await expect(getFilesizeGzippedInBytes(dirPath)).rejects.toThrow();
        });
    });

    describe("getContentFromFiles", () => {
        test("should return content from multiple files", () => {
            const content = getContentFromFiles([fixtureFile, fixtureFile]);
            expect(content).toContain("console.log('content');");
        });

        test("should return empty string for empty array", () => {
            expect(getContentFromFiles([])).toBe("");
        });

        test("should throw if input is null", () => {
            expect(() => getContentFromFiles(null as any)).toThrow();
        });

        test("should throw if one file does not exist", () => {
            expect(() =>
                getContentFromFiles([fixtureFile, "fake.js"])
            ).toThrow();
        });

        test("should throw if one path is a directory", () => {
            expect(() =>
                getContentFromFiles([fixtureFile, __dirname])
            ).toThrow();
        });
    });

    describe("compressSingleFile", () => {
        test("should compress with content", async () => {
            const compressor = vi.fn().mockResolvedValue("minified");
            const settings = {
                compressor,
                content: "content",
            } as any;
            const result = await compressSingleFile(settings);
            expect(result).toBe("minified");
        });

        test("should compress with input file", async () => {
            const compressor = vi.fn().mockResolvedValue("minified");
            const settings = {
                compressor,
                input: fixtureFile,
            } as any;
            const result = await compressSingleFile(settings);
            expect(result).toBe("minified");
        });

        test("should return empty string if no content or input", async () => {
            const compressor = vi.fn().mockResolvedValue("minified");
            const settings = {
                compressor,
            } as any;
            await compressSingleFile(settings);
            expect(compressor).toHaveBeenCalledWith(
                expect.objectContaining({ content: "" })
            );
        });
    });
});
