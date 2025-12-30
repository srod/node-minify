/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync, unlinkSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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
    ensureStringContent,
    getContentFromFiles,
    getFilesizeGzippedInBytes,
    getFilesizeInBytes,
    isValidFile,
    prettyBytes,
    readFile,
    resetDeprecationWarnings,
    run,
    setFileNameMin,
    toBuildArgsOptions,
    warnDeprecation,
    writeFile,
} from "../src/index.ts";

const fixtureFile = `${__dirname}/../../../tests/fixtures/fixture-content.js`;

describe("Package: utils", () => {
    const filesToCleanup = new Set<string>();

    afterEach(() => {
        for (const file of filesToCleanup) {
            try {
                if (existsSync(file)) {
                    deleteFile(file);
                }
            } catch {
                // Ignore cleanup errors
            }
        }
        filesToCleanup.clear();
    });

    describe("readFile", () => {
        test("should return the content", () =>
            expect(readFile(fixtureFile)).toMatch("console.log('content');"));

        test("should throw an error if file does not exist", () => {
            expect(() => readFile("fake.js")).toThrow();
        });

        test("should throw an error if path is a directory", () => {
            expect(() => readFile(__dirname)).toThrow("Path is not a file");
        });

        test("should return Buffer when asBuffer is true", () => {
            const buffer = readFile(fixtureFile, true);
            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.toString("utf-8")).toMatch("console.log('content');");
        });

        test("should return string when asBuffer is false", () => {
            const content = readFile(fixtureFile, false);
            expect(typeof content).toBe("string");
            expect(content).toMatch("console.log('content');");
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
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
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

        test("should handle index with non-array file", () => {
            const file = `${__dirname}/../../../tests/tmp/temp-index.js`;
            expect(
                writeFile({
                    file,
                    content: "content",
                    index: 0,
                })
            ).toBe("content");
            expect(readFile(file)).toBe("content");
        });

        test("should throw if targetFile is not a string", () => {
            expect(() =>
                writeFile({
                    file: [null as any],
                    content: "content",
                    index: 0,
                })
            ).toThrow(ValidationError);
        });

        test("should throw FileOperationError on multi-file failure", () => {
            expect(() =>
                writeFile({
                    file: [__dirname],
                    content: "content",
                    index: 0,
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

        test("should throw if options is null", () => {
            expect(() => buildArgs(null as any)).toThrow(ValidationError);
        });

        test("should filter out undefined and false values", () => {
            expect(
                buildArgs({
                    foo: undefined,
                    bar: false,
                    baz: true,
                })
            ).toEqual(["--baz"]);
        });
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

        test("should throw if publicFolder is not a string", () => {
            expect(() =>
                setFileNameMin("foo.js", "$1.min.js", 123 as any)
            ).toThrow(ValidationError);
        });

        test("should throw generic error if something unexpected happens", () => {
            const spy = vi
                .spyOn(String.prototype, "lastIndexOf")
                .mockImplementation(() => {
                    throw new Error("Unexpected error");
                });
            expect(() => setFileNameMin("foo.js", "$1.min.js")).toThrow(
                ValidationError
            );
            spy.mockRestore();
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
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
                content: "content",
            } as any;
            const result = await compressSingleFile(settings);
            expect(result).toBe("minified");
        });

        test("should compress with input file", async () => {
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
                input: fixtureFile,
            } as any;
            const result = await compressSingleFile(settings);
            expect(result).toBe("minified");
        });

        test("should return empty string if no content or input", async () => {
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
            } as any;
            await compressSingleFile(settings);
            expect(compressor).toHaveBeenCalledWith(
                expect.objectContaining({ content: "" })
            );
        });

        test("should return empty string when input is undefined", async () => {
            const compressor = vi.fn().mockResolvedValue({ code: "" });
            const settings = {
                compressor,
                input: undefined,
                content: undefined,
            } as any;
            const result = await compressSingleFile(settings);
            expect(result).toBe("");
            expect(compressor).toHaveBeenCalledWith(
                expect.objectContaining({ content: "" })
            );
        });
    });

    describe("warnDeprecation", () => {
        beforeEach(() => {
            resetDeprecationWarnings();
            vi.spyOn(console, "warn").mockImplementation(() => {});
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        test("should warn once for a package", () => {
            warnDeprecation("test-package", "This is deprecated");
            expect(console.warn).toHaveBeenCalledTimes(1);
            expect(console.warn).toHaveBeenCalledWith(
                "[@node-minify/test-package] DEPRECATED: This is deprecated"
            );
        });

        test("should not warn twice for the same package", () => {
            warnDeprecation("test-package", "This is deprecated");
            warnDeprecation("test-package", "This is deprecated");
            expect(console.warn).toHaveBeenCalledTimes(1);
        });

        test("should warn separately for different packages", () => {
            warnDeprecation("package-a", "Deprecated A");
            warnDeprecation("package-b", "Deprecated B");
            expect(console.warn).toHaveBeenCalledTimes(2);
        });
    });

    describe("resetDeprecationWarnings", () => {
        beforeEach(() => {
            vi.spyOn(console, "warn").mockImplementation(() => {});
        });

        afterEach(() => {
            resetDeprecationWarnings();
            vi.restoreAllMocks();
        });

        test("should allow warning again after reset", () => {
            warnDeprecation("test-package", "First warning");
            expect(console.warn).toHaveBeenCalledTimes(1);

            resetDeprecationWarnings();

            warnDeprecation("test-package", "Second warning");
            expect(console.warn).toHaveBeenCalledTimes(2);
        });
    });

    describe("toBuildArgsOptions", () => {
        test("should keep string values", () => {
            expect(toBuildArgsOptions({ foo: "bar" })).toEqual({ foo: "bar" });
        });

        test("should keep number values", () => {
            expect(toBuildArgsOptions({ count: 42 })).toEqual({ count: 42 });
        });

        test("should keep boolean values", () => {
            expect(toBuildArgsOptions({ enabled: true })).toEqual({
                enabled: true,
            });
        });

        test("should keep undefined values", () => {
            expect(toBuildArgsOptions({ opt: undefined })).toEqual({
                opt: undefined,
            });
        });

        test("should filter out object values", () => {
            expect(toBuildArgsOptions({ nested: { a: 1 } })).toEqual({});
        });

        test("should filter out array values", () => {
            expect(toBuildArgsOptions({ list: [1, 2, 3] })).toEqual({});
        });

        test("should filter out null values", () => {
            expect(toBuildArgsOptions({ empty: null })).toEqual({});
        });

        test("should handle mixed values", () => {
            const input = {
                str: "value",
                num: 123,
                bool: false,
                obj: { nested: true },
                arr: [1, 2],
                undef: undefined,
            };
            expect(toBuildArgsOptions(input)).toEqual({
                str: "value",
                num: 123,
                bool: false,
                undef: undefined,
            });
        });
    });

    describe("run with file output", () => {
        const tmpDir = `${__dirname}/../../../tests/tmp`;

        test("should write output file when output is specified", async () => {
            const outputFile = `${tmpDir}/run-output.js`;
            filesToCleanup.add(outputFile);
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
                input: fixtureFile,
                output: outputFile,
            } as any;

            await run({ settings, content: "content" });

            expect(readFile(outputFile)).toBe("minified");
        });

        test("should write source map when result includes map", async () => {
            const outputFile = `${tmpDir}/run-output-map.js`;
            const mapFile = `${tmpDir}/run-output-map.js.map`;
            filesToCleanup.add(outputFile);
            filesToCleanup.add(mapFile);
            const compressor = vi.fn().mockResolvedValue({
                code: "minified",
                map: '{"version":3}',
            });
            const settings = {
                compressor,
                input: fixtureFile,
                output: outputFile,
                options: {
                    sourceMap: { url: mapFile },
                },
            } as any;

            await run({ settings, content: "content" });

            expect(readFile(outputFile)).toBe("minified");
            expect(readFile(mapFile)).toBe('{"version":3}');
        });

        test("should use sourceMap.filename if url not present", async () => {
            const outputFile = `${tmpDir}/run-output-filename.js`;
            const mapFile = `${tmpDir}/run-output-filename.js.map`;
            filesToCleanup.add(outputFile);
            filesToCleanup.add(mapFile);
            const compressor = vi.fn().mockResolvedValue({
                code: "minified",
                map: '{"version":3}',
            });
            const settings = {
                compressor,
                input: fixtureFile,
                output: outputFile,
                options: {
                    sourceMap: { filename: mapFile },
                },
            } as any;

            await run({ settings, content: "content" });

            expect(readFile(mapFile)).toBe('{"version":3}');
        });

        test("should use _sourceMap.url as fallback", async () => {
            const outputFile = `${tmpDir}/run-output-underscore.js`;
            const mapFile = `${tmpDir}/run-output-underscore.js.map`;
            filesToCleanup.add(outputFile);
            filesToCleanup.add(mapFile);
            const compressor = vi.fn().mockResolvedValue({
                code: "minified",
                map: '{"version":3}',
            });
            const settings = {
                compressor,
                input: fixtureFile,
                output: outputFile,
                options: {
                    _sourceMap: { url: mapFile },
                },
            } as any;

            await run({ settings, content: "content" });

            expect(readFile(mapFile)).toBe('{"version":3}');
        });

        test("should not write source map if no url found", async () => {
            const outputFile = `${tmpDir}/run-output-nomap.js`;
            filesToCleanup.add(outputFile);
            const compressor = vi.fn().mockResolvedValue({
                code: "minified",
                map: '{"version":3}',
            });
            const settings = {
                compressor,
                input: fixtureFile,
                output: outputFile,
                options: {
                    sourceMap: { inline: true },
                },
            } as any;

            await run({ settings, content: "content" });

            expect(readFile(outputFile)).toBe("minified");
        });

        test("should not write files in memory mode", async () => {
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
                content: "source content",
            } as any;

            const result = await run({ settings, content: "source content" });

            expect(result).toBe("minified");
        });

        test("should not write files when no output specified", async () => {
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
                input: fixtureFile,
            } as any;

            const result = await run({ settings, content: "content" });

            expect(result).toBe("minified");
        });

        test("should not write source map when options is undefined", async () => {
            const outputFile = `${tmpDir}/run-output-no-options.js`;
            filesToCleanup.add(outputFile);
            const compressor = vi.fn().mockResolvedValue({
                code: "minified",
                map: '{"version":3}',
            });
            const settings = {
                compressor,
                input: fixtureFile,
                output: outputFile,
            } as any;

            await run({ settings, content: "content" });

            expect(readFile(outputFile)).toBe("minified");
        });
    });

    describe("run with buffer output (image compression)", () => {
        const tmpDir = `${__dirname}/../../../tests/tmp`;

        test("should write buffer output to file", async () => {
            const outputFile = `${tmpDir}/buffer-output.png`;
            filesToCleanup.add(outputFile);
            const bufferContent = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // PNG header
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                buffer: bufferContent,
            });
            const settings = {
                compressor,
                input: `${tmpDir}/input.png`,
                output: outputFile,
            } as any;

            const result = await run({ settings, content: "" });

            expect(result).toBe("");
            const writtenContent = readFile(outputFile, true);
            expect(writtenContent).toBeInstanceOf(Buffer);
            expect(Buffer.isBuffer(writtenContent)).toBe(true);
        });

        test("should not write file in memory mode with buffer", async () => {
            const bufferContent = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                buffer: bufferContent,
            });
            const settings = {
                compressor,
                content: "source content",
            } as any;

            const result = await run({ settings, content: "source content" });

            expect(result).toBe("");
        });
    });

    describe("run with multiple outputs (multi-format image conversion)", () => {
        const tmpDir = `${__dirname}/../../../tests/tmp`;

        test("should write multiple output files from outputs array", async () => {
            const webpFile = `${tmpDir}/multi-webp.png`;
            const avifFile = `${tmpDir}/multi-avif.png`;
            filesToCleanup.add(webpFile);
            filesToCleanup.add(avifFile);
            const webpContent = Buffer.from("WEBP_CONTENT");
            const avifContent = Buffer.from("AVIF_CONTENT");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [
                    { format: "webp", content: webpContent },
                    { format: "avif", content: avifContent },
                ],
            });
            const settings = {
                compressor,
                input: `${tmpDir}/input.png`,
                output: [webpFile, avifFile],
            } as any;

            const result = await run({ settings, content: "" });

            expect(result).toBe("");
            expect(readFile(webpFile, true)).toEqual(webpContent);
            expect(readFile(avifFile, true)).toEqual(avifContent);
        });

        test("should auto-generate filenames with format extension using $1 pattern", async () => {
            const testFile = `${tmpDir}/test-image.png`;
            filesToCleanup.add(testFile);
            filesToCleanup.add(`${tmpDir}/test-image.webp`);
            filesToCleanup.add(`${tmpDir}/test-image.avif`);
            // Create a small file to use as input
            writeFile({ file: testFile, content: "test" });
            const webpContent = Buffer.from("WEBP_DATA");
            const avifContent = Buffer.from("AVIF_DATA");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [
                    { format: "webp", content: webpContent },
                    { format: "avif", content: avifContent },
                ],
            });
            const settings = {
                compressor,
                input: testFile,
                output: "$1", // Will generate test-image.webp and test-image.avif
            } as any;

            const result = await run({ settings, content: "" });

            expect(result).toBe("");
            expect(readFile(`${tmpDir}/test-image.webp`, true)).toEqual(
                webpContent
            );
            expect(readFile(`${tmpDir}/test-image.avif`, true)).toEqual(
                avifContent
            );
        });

        test("should use format from output if provided", async () => {
            const outputFile = `${tmpDir}/multi-format.png`;
            filesToCleanup.add(`${outputFile}.webp`);
            const webpContent = Buffer.from("WEBP_DATA");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ format: "webp", content: webpContent }],
            });
            const settings = {
                compressor,
                input: `${tmpDir}/input.png`,
                output: outputFile,
            } as any;

            await run({ settings, content: "" });

            // Should write with .webp extension appended
            expect(readFile(`${outputFile}.webp`, true)).toEqual(webpContent);
        });

        test("should not write files when no output specified with outputs", async () => {
            const webpContent = Buffer.from("WEBP_DATA");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ format: "webp", content: webpContent }],
            });
            const settings = {
                compressor,
                input: `${tmpDir}/input.png`,
            } as any;

            const result = await run({ settings, content: "" });

            expect(result).toBe("");
        });

        test("should not write files in memory mode with outputs", async () => {
            const webpContent = Buffer.from("WEBP_DATA");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ format: "webp", content: webpContent }],
            });
            const settings = {
                compressor,
                content: "source content",
            } as any;

            const result = await run({ settings, content: "source content" });

            expect(result).toBe("");
        });

        test("should handle empty outputs array gracefully", async () => {
            const compressor = vi.fn().mockResolvedValue({
                code: "minified",
                outputs: [],
            });
            const settings = {
                compressor,
                input: `${tmpDir}/input.png`,
                output: `${tmpDir}/output.png`,
            } as any;

            const result = await run({ settings, content: "" });

            // Should return code without writing any multi-output files
            expect(result).toBe("minified");
        });

        test("should handle mixed array with $1 and explicit paths", async () => {
            const testFile = `${tmpDir}/source-image.png`;
            filesToCleanup.add(testFile);
            filesToCleanup.add(`${tmpDir}/source-image.webp`);
            filesToCleanup.add(`${tmpDir}/explicit-output.avif`);
            writeFile({ file: testFile, content: "test" });
            const webpContent = Buffer.from("WEBP_MIXED");
            const avifContent = Buffer.from("AVIF_MIXED");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [
                    { format: "webp", content: webpContent },
                    { format: "avif", content: avifContent },
                ],
            });
            const settings = {
                compressor,
                input: testFile,
                output: ["$1", `${tmpDir}/explicit-output.avif`],
            } as any;

            await run({ settings, content: "" });

            // First output uses $1 fallback (auto-generated in input dir)
            expect(readFile(`${tmpDir}/source-image.webp`, true)).toEqual(
                webpContent
            );
            // Second output uses explicit path
            expect(readFile(`${tmpDir}/explicit-output.avif`, true)).toEqual(
                avifContent
            );
        });

        test("should handle $1 pattern in path (replace and append format)", async () => {
            const testFile = `${tmpDir}/my-image.png`;
            filesToCleanup.add(testFile);
            filesToCleanup.add(`${tmpDir}/my-image-converted.webp`);
            writeFile({ file: testFile, content: "test" });
            const webpContent = Buffer.from("WEBP_PATTERN");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ format: "webp", content: webpContent }],
            });
            const settings = {
                compressor,
                input: testFile,
                output: `${tmpDir}/$1-converted`,
            } as any;

            await run({ settings, content: "" });

            // $1 replaced with input basename, format appended
            expect(readFile(`${tmpDir}/my-image-converted.webp`, true)).toEqual(
                webpContent
            );
        });

        test("should handle empty string in output array (fallback to auto-generated)", async () => {
            const testFile = `${tmpDir}/fallback-test.png`;
            filesToCleanup.add(testFile);
            filesToCleanup.add(`${tmpDir}/fallback-test.webp`);
            writeFile({ file: testFile, content: "test" });
            const webpContent = Buffer.from("WEBP_FALLBACK");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ format: "webp", content: webpContent }],
            });
            const settings = {
                compressor,
                input: testFile,
                output: [""],
            } as any;

            await run({ settings, content: "" });

            // Empty string triggers fallback to auto-generated path
            expect(readFile(`${tmpDir}/fallback-test.webp`, true)).toEqual(
                webpContent
            );
        });

        test("should handle more outputs than array items (fallback for extras)", async () => {
            const testFile = `${tmpDir}/extra-test.png`;
            filesToCleanup.add(testFile);
            filesToCleanup.add(`${tmpDir}/first.webp`);
            filesToCleanup.add(`${tmpDir}/extra-test.avif`);
            filesToCleanup.add(`${tmpDir}/extra-test.jpeg`);
            writeFile({ file: testFile, content: "test" });
            const webpContent = Buffer.from("WEBP_EXTRA");
            const avifContent = Buffer.from("AVIF_EXTRA");
            const jpegContent = Buffer.from("JPEG_EXTRA");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [
                    { format: "webp", content: webpContent },
                    { format: "avif", content: avifContent },
                    { format: "jpeg", content: jpegContent },
                ],
            });
            const settings = {
                compressor,
                input: testFile,
                output: [`${tmpDir}/first.webp`], // Only one explicit, two need fallback
            } as any;

            await run({ settings, content: "" });

            // First uses explicit path
            expect(readFile(`${tmpDir}/first.webp`, true)).toEqual(webpContent);
            // Second and third fall back to auto-generated
            expect(readFile(`${tmpDir}/extra-test.avif`, true)).toEqual(
                avifContent
            );
            expect(readFile(`${tmpDir}/extra-test.jpeg`, true)).toEqual(
                jpegContent
            );
        });

        test("should use 'out' as default format when format is missing", async () => {
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ content: Buffer.from("NO_FORMAT") }],
            });
            const settings = {
                compressor,
                input: `${tmpDir}/input.png`,
                output: `${tmpDir}/no-format-output`,
            } as any;

            await run({ settings, content: "" });

            expect(readFile(`${tmpDir}/no-format-output.out`, true)).toEqual(
                Buffer.from("NO_FORMAT")
            );
        });

        test("should skip undefined elements in sparse outputs array", async () => {
            const testFile = `${tmpDir}/sparse-test.png`;
            filesToCleanup.add(testFile);
            filesToCleanup.add(`${tmpDir}/sparse-test.avif`);
            writeFile({ file: testFile, content: "test" });
            const avifContent = Buffer.from("AVIF_SPARSE");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [
                    undefined,
                    { format: "avif", content: avifContent },
                ] as any,
            });
            const settings = {
                compressor,
                input: testFile,
                output: "$1",
            } as any;

            await run({ settings, content: "" });

            expect(readFile(`${tmpDir}/sparse-test.avif`, true)).toEqual(
                avifContent
            );
        });

        test("should use 'output' as default basename when input has no name", async () => {
            const webpContent = Buffer.from("WEBP_NO_INPUT");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ format: "webp", content: webpContent }],
            });
            const settings = {
                compressor,
                input: [],
                output: `${tmpDir}/default-output`,
            } as any;
            filesToCleanup.add(`${tmpDir}/default-output.webp`);

            await run({ settings, content: "" });

            expect(readFile(`${tmpDir}/default-output.webp`, true)).toEqual(
                webpContent
            );
        });

        test("should handle fallback when output array has undefined item", async () => {
            const testFile = `${tmpDir}/fallback-undef-test.png`;
            filesToCleanup.add(testFile);
            filesToCleanup.add(`${tmpDir}/fallback-undef-test.webp`);
            filesToCleanup.add(`${tmpDir}/fallback-undef-test.avif`);
            writeFile({ file: testFile, content: "test" });
            const webpContent = Buffer.from("WEBP_FALLBACK_UNDEF");
            const avifContent = Buffer.from("AVIF_FALLBACK_UNDEF");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [
                    { format: "webp", content: webpContent },
                    { format: "avif", content: avifContent },
                ],
            });
            const settings = {
                compressor,
                input: testFile,
                output: [
                    undefined as unknown as string,
                    undefined as unknown as string,
                ],
            } as any;

            await run({ settings, content: "" });

            expect(
                readFile(`${tmpDir}/fallback-undef-test.webp`, true)
            ).toEqual(webpContent);
            expect(
                readFile(`${tmpDir}/fallback-undef-test.avif`, true)
            ).toEqual(avifContent);
        });

        test("should use 'output' as default in $1 pattern when input basename is empty", async () => {
            const webpContent = Buffer.from("WEBP_PATTERN_EMPTY");
            const compressor = vi.fn().mockResolvedValue({
                code: "",
                outputs: [{ format: "webp", content: webpContent }],
            });
            const settings = {
                compressor,
                input: "",
                output: `${tmpDir}/$1-converted`,
            } as any;
            filesToCleanup.add(`${tmpDir}/output-converted.webp`);

            await run({ settings, content: "" });

            expect(readFile(`${tmpDir}/output-converted.webp`, true)).toEqual(
                webpContent
            );
        });
    });

    describe("compressSingleFile with Buffer content", () => {
        test("should pass Buffer content unchanged to compressor", async () => {
            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const bufferContent = Buffer.from("console.log('buffer');");
            const settings = {
                compressor,
                content: bufferContent,
            } as any;
            const result = await compressSingleFile(settings);
            expect(result).toBe("minified");
            expect(compressor).toHaveBeenCalledWith(
                expect.objectContaining({ content: bufferContent })
            );
        });
    });

    describe("ensureStringContent", () => {
        test("should return string content unchanged", () => {
            expect(ensureStringContent("hello", "test")).toBe("hello");
        });

        test("should return empty string for undefined content", () => {
            expect(ensureStringContent(undefined, "test")).toBe("");
        });

        test("should convert Buffer to string", () => {
            const buffer = Buffer.from("buffer content");
            expect(ensureStringContent(buffer, "test")).toBe("buffer content");
        });

        test("should throw error for array content", () => {
            const arrayContent = [Buffer.from("a"), Buffer.from("b")];
            expect(() =>
                ensureStringContent(arrayContent, "myCompressor")
            ).toThrow("myCompressor compressor does not support array content");
        });

        test("should include compressor name in error message", () => {
            expect(() => ensureStringContent([], "terser")).toThrow(
                "terser compressor does not support array content"
            );
        });
    });

    describe("determineContent mixed-type array validation", () => {
        const tmpDir = `${__dirname}/../../../tests/tmp`;

        test("should throw an error when mixing image and text files in input array", async () => {
            const compressor = vi.fn().mockResolvedValue({ code: "" });
            const settings = {
                compressor,
                input: [`${tmpDir}/image.png`, `${tmpDir}/script.js`],
                output: `${tmpDir}/output.js`,
            } as any;

            await expect(compressSingleFile(settings)).rejects.toThrow(
                "Cannot mix image and text files in the same input array"
            );
        });

        test("should allow uniform image array in input array", async () => {
            const testFile1 = `${tmpDir}/image1.png`;
            const testFile2 = `${tmpDir}/image2.png`;
            filesToCleanup.add(testFile1);
            filesToCleanup.add(testFile2);
            writeFile({ file: testFile1, content: "image1" });
            writeFile({ file: testFile2, content: "image2" });

            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
                input: [testFile1, testFile2],
                output: `${tmpDir}/output.png`,
            } as any;

            await compressSingleFile(settings);
            expect(compressor).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: [Buffer.from("image1"), Buffer.from("image2")],
                })
            );
        });

        test("should read single image file as Buffer", async () => {
            const testFile = `${tmpDir}/single-image.png`;
            filesToCleanup.add(testFile);
            writeFile({ file: testFile, content: "image-data" });

            const compressor = vi.fn().mockResolvedValue({ code: "minified" });
            const settings = {
                compressor,
                input: testFile,
                output: `${tmpDir}/output.png`,
            } as any;

            await compressSingleFile(settings);
            expect(compressor).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: Buffer.from("image-data"),
                })
            );
        });
    });
});
