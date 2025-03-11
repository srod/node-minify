/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import type { Compressor, Settings } from "@node-minify/types";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { gcc } from "../../google-closure-compiler/src/index.ts";
import { htmlMinifier } from "../../html-minifier/src/index.ts";
import { noCompress } from "../../no-compress/src/index.ts";
import { uglifyEs } from "../../uglify-es/src/index.ts";
import { yui } from "../../yui/src/index.ts";
import { minify } from "../src/index.ts";

const compressorLabel = "uglify-es";
const compressor = uglifyEs;

describe("Package: core", async () => {
    if (!tests.commonjs) {
        throw new Error("Tests not found");
    }

    // Run commonjs tests
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

            expect(minify(settings)).rejects.toThrow();
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
});
