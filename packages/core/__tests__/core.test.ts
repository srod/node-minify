/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import { statSync } from "node:fs";
import type { Compressor, Settings } from "@node-minify/types";
import {
    afterAll,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";

vi.mock("node:fs", async (importOriginal) => {
    const actual = await importOriginal<typeof import("node:fs")>();
    return {
        ...actual,
        statSync: vi.fn(actual.statSync),
        lstatSync: vi.fn(actual.lstatSync),
    };
});

import { filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { gcc } from "../../google-closure-compiler/src/index.ts";
import { htmlMinifier } from "../../html-minifier/src/index.ts";
import { noCompress } from "../../no-compress/src/index.ts";
import { uglifyEs } from "../../uglify-es/src/index.ts";
import { yui } from "../../yui/src/index.ts";
import { minify } from "../src/index.ts";
import { setup } from "../src/setup.ts";

const compressorLabel = "uglify-es";
const compressor = uglifyEs;

describe("Package: core", async () => {
    if (!tests.commonjs) {
        throw new Error("Tests not found");
    }

    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    describe("Fake binary", () => {
        test("should throw an error if binary does not exist", async () => {
            const settings: Settings = {
                compressor: "fake" as unknown as Compressor,
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
            };

            try {
                return await minify(settings);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    return expect(err.toString()).toEqual(
                        "Error: compressor should be a function, maybe you forgot to install the compressor"
                    );
                }
            }
        });
    });

    describe("No mandatory", () => {
        test("should throw an error if no compressor", async () => {
            const settings: Partial<Settings> = {
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
            };

            try {
                return await minify(settings as Settings);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    return expect(err.toString()).toEqual(
                        "Error: compressor is mandatory."
                    );
                }
            }
        });

        test("should throw an error if no input", async () => {
            const settings: Settings = {
                compressor: noCompress,
                output: filesJS.fileJSOut,
            };

            try {
                return await minify(settings);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    return expect(err.toString()).toEqual(
                        "Error: input is mandatory."
                    );
                }
            }
        });

        test("should throw an error if no output", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: filesJS.oneFileWithWildcards,
            };

            try {
                return await minify(settings);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    return expect(err.toString()).toEqual(
                        "Error: output is mandatory."
                    );
                }
            }
        });
    });

    describe("Create errors", () => {
        test("should catch an error if yui with bad options", async () => {
            const settings: Settings = {
                compressor: yui,
                type: "js",
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                options: {
                    fake: true,
                },
            };

            try {
                return await minify(settings);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    return expect(err.toString()).toMatch("Error");
                }
            }
        });
    });

    describe("Create errors", () => {
        beforeAll(() => {
            const spy = vi.spyOn(childProcess, "spawn");
            spy.mockImplementation(() => {
                throw new Error();
            });
        });
        test("should throw an error on spawn", async () => {
            const settings: Settings = {
                compressor: yui,
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                options: {
                    fake: true,
                },
            };

            await expect(minify(settings)).rejects.toThrow();
        });
        afterAll(() => {
            vi.restoreAllMocks();
        });
    });

    describe("Mandatory", () => {
        test("should show throw on type option", async () => {
            const settings: Partial<Settings> = {
                type: "uglifyjs" as unknown as "js",
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
            };

            try {
                return await minify(settings as Settings);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    return expect(err.toString()).toEqual(
                        "Error: compressor is mandatory."
                    );
                }
            }
        });
    });

    describe("Should be OK", () => {
        test("should be OK with GCC", async () => {
            const settings: Settings = {
                compressor: gcc,
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
            };

            const min = await minify(settings);
            expect(min).toBeDefined();
        });
    });

    describe("In Memory", () => {
        test("should be OK with html minifier", async () => {
            const settings: Settings = {
                compressor: htmlMinifier,
                content:
                    "<html lang='en'><body><div>content</div></body></html>",
            };

            const min = await minify(settings);
            expect(min).toBeDefined();
        });

        test("should throw an error if binary does not exist", async () => {
            const settings: Settings = {
                compressor: "fake" as unknown as Compressor,
                content:
                    "<html lang='en'><body><div>content</div></body></html>",
            };

            try {
                return await minify(settings);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    return expect(err.toString()).toEqual(
                        "Error: compressor should be a function, maybe you forgot to install the compressor"
                    );
                }
            }
        });
    });

    describe("Compress Array of Files", () => {
        test("should compress an array of files", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: [filesJS.oneFile, filesJS.oneFile],
                output: [filesJS.fileJSOut, filesJS.fileJSOut],
            };

            const min = await minify(settings);
            expect(min).toBeDefined();
        });

        test("should throw when output is array but input is not", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: filesJS.oneFile,
                output: [filesJS.fileJSOut, filesJS.fileJSOut],
            };

            await expect(minify(settings)).rejects.toThrow(
                "When output is an array, input must also be an array"
            );
        });

        test("should throw when input and output arrays have different lengths", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: [filesJS.oneFile, filesJS.oneFile, filesJS.oneFile],
                output: [filesJS.fileJSOut, filesJS.fileJSOut],
            };

            await expect(minify(settings)).rejects.toThrow(
                "Input and output arrays must have the same length (input: 3, output: 2)"
            );
        });

        test("should skip non-string paths in array", async () => {
            const settings = {
                compressor: () => ({ code: "minified" }),
                input: [filesJS.oneFile],
                output: [123 as any],
            };
            await expect(minify(settings as any)).rejects.toThrow(
                "Invalid target file path"
            );
        });

        test("should throw an error if an input in the array is an empty string", async () => {
            const settings = {
                compressor: noCompress,
                input: [filesJS.oneFile, ""],
                output: [filesJS.fileJSOut, filesJS.fileJSOut],
            };

            await expect(minify(settings as any)).rejects.toThrow(
                "Invalid input at index 1: expected non-empty string, got empty string"
            );
        });

        test("should throw an error if an input in the array is null", async () => {
            const settings = {
                compressor: noCompress,
                input: [filesJS.oneFile, null],
                output: [filesJS.fileJSOut, filesJS.fileJSOut],
            };

            await expect(minify(settings as any)).rejects.toThrow(
                "Invalid input at index 1: expected non-empty string, got object"
            );
        });

        test("should throw an error if an input in the array is undefined", async () => {
            const settings = {
                compressor: noCompress,
                input: [filesJS.oneFile, undefined],
                output: [filesJS.fileJSOut, filesJS.fileJSOut],
            };

            await expect(minify(settings as any)).rejects.toThrow(
                "Invalid input at index 1: expected non-empty string, got undefined"
            );
        });

        test("should throw an error if an input in the array is a number", async () => {
            const settings = {
                compressor: noCompress,
                input: [filesJS.oneFile, 123],
                output: [filesJS.fileJSOut, filesJS.fileJSOut],
            };

            await expect(minify(settings as any)).rejects.toThrow(
                "Invalid input at index 1: expected non-empty string, got number"
            );
        });
    });

    describe("Create Directory", () => {
        test("should create directory if it does not exist", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: filesJS.oneFile,
                output: `${__dirname}/../../../tests/tmp/new-dir/out.js`,
            };

            const min = await minify(settings);
            expect(min).toBeDefined();
        });

        test("should handle missing directory path", async () => {
            const settings = {
                compressor: () => ({ code: "minified" }),
                content: "foo",
                output: "bar.js",
            };
            await minify(settings as any);
        });

        test("should handle missing filePath", async () => {
            const settings = {
                compressor: () => ({ code: "minified" }),
                content: "foo",
                output: "",
            };
            await minify(settings as any);
        });

        test("should handle directoryExists returning false (catch block)", async () => {
            vi.mocked(statSync).mockImplementationOnce(() => {
                throw new Error("Not found");
            });
            const settings = {
                compressor: () => ({ code: "minified" }),
                content: "foo",
                output: "newdir/bar.js", // Must have a slash
            };
            await minify(settings as any);
        });

        test("should handle directoryExists returning false (isDirectory false)", async () => {
            vi.mocked(statSync).mockImplementationOnce(() => {
                return { isDirectory: () => false } as any;
            });
            const settings = {
                compressor: () => ({ code: "minified" }),
                content: "foo",
                output: "notadir/bar.js", // Must have a slash
            };
            await minify(settings as any);
        });
    });

    describe("Wildcards", () => {
        test("should handle wildcards with publicFolder", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: "*.js",
                output: filesJS.fileJSOut,
                publicFolder: `${__dirname}/../../../tests/fixtures/`,
            };

            const min = await minify(settings);
            expect(min).toBeDefined();
        });

        test("should handle array of wildcards", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: ["*.js"],
                output: filesJS.fileJSOut,
                publicFolder: `${__dirname}/../../../tests/fixtures/`,
            };

            const min = await minify(settings);
            expect(min).toBeDefined();
        });
    });

    describe("setup functions", () => {
        test("should return undefined if output is an array (checkOutput)", () => {
            const result = setup({
                compressor: noCompress,
                input: ["foo.js"],
                output: ["bar.js"],
            } as any);
            expect(result.output).toEqual(["bar.js"]);
        });

        test("should handle publicFolder as non-string", async () => {
            const settings: any = {
                compressor: noCompress,
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                publicFolder: 123,
            };

            const min = await minify(settings);
            expect(min).toBeDefined();
        });
    });

    describe("parallel array processing", () => {
        beforeEach(() => {
            vi.restoreAllMocks();
        });

        test("should compress multiple files in parallel with array input/output", async () => {
            const outputFile1 = `${__dirname}/../../../tests/tmp/parallel-1.js`;
            const outputFile2 = `${__dirname}/../../../tests/tmp/parallel-2.js`;
            const settings: Settings = {
                compressor: noCompress,
                input: filesJS.filesArray,
                output: [outputFile1, outputFile2],
            };

            const min = await minify(settings);
            expect(min).toBeDefined();

            const fs = await import("node:fs");
            expect(fs.existsSync(outputFile1)).toBe(true);
            expect(fs.existsSync(outputFile2)).toBe(true);
        });

        test("should throw error when input/output array lengths mismatch", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: filesJS.filesArray,
                output: [`${__dirname}/../../../tests/tmp/single-output.js`],
            };

            await expect(minify(settings)).rejects.toThrow(
                "Input and output arrays must have the same length"
            );
        });

        test("should throw error when output is array but input is not", async () => {
            const settings: Settings = {
                compressor: noCompress,
                input: filesJS.oneFile,
                output: [`${__dirname}/../../../tests/tmp/output.js`],
            };

            await expect(minify(settings)).rejects.toThrow(
                "When output is an array, input must also be an array"
            );
        });
    });
});
