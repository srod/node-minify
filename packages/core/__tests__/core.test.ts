/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import type { OptionsTest } from "@node-minify/types";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { filesJS } from "../../../tests/files-path";
import { runOneTest, tests } from "../../../tests/fixtures";
import gcc from "../../google-closure-compiler/src";
import htmlMinifier from "../../html-minifier/src";
import noCompress from "../../no-compress/src";
import uglifyes from "../../uglify-es/src";
import yui from "../../yui/src";
import minify from "../src";

const compressorLabel = "uglify-es";
const compressor = uglifyes;

describe("Package: core", async () => {
    // Run async tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }

    describe("Fake binary", () => {
        test("should throw an error if binary does not exist", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: "fake",
                    input: filesJS.oneFileWithWildcards,
                    output: filesJS.fileJSOut,
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toEqual(
                    "Error: compressor should be a function, maybe you forgot to install the compressor"
                );
            }
        });
    });

    describe("No mandatories", () => {
        test("should throw an error if no compressor", async () => {
            const options: OptionsTest = {
                minify: {
                    input: filesJS.oneFileWithWildcards,
                    output: filesJS.fileJSOut,
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toEqual(
                    "Error: compressor is mandatory."
                );
            }
        });

        test("should throw an error if no input", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: noCompress,
                    output: filesJS.fileJSOut,
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toEqual(
                    "Error: input is mandatory."
                );
            }
        });

        test("should throw an error if no output", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: noCompress,
                    input: filesJS.oneFileWithWildcards,
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toEqual(
                    "Error: output is mandatory."
                );
            }
        });
    });

    describe("Create errors", () => {
        test("should catch an error if yui with bad options", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: yui,
                    type: "js",
                    input: filesJS.oneFile,
                    output: filesJS.fileJSOut,
                    options: {
                        fake: true,
                    },
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toMatch("Error");
            }
        });
        test("should catch an error if yui with bad options and sync", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: yui,
                    type: "js",
                    input: filesJS.oneFile,
                    output: filesJS.fileJSOut,
                    sync: true,
                    options: {
                        fake: true,
                    },
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toMatch("Error");
            }
        });
    });

    describe("Create sync errors", () => {
        beforeAll(() => {
            const spy = vi.spyOn(childProcess, "spawnSync");
            spy.mockImplementation(() => {
                throw new Error();
            });
        });
        test("should callback an error on spawnSync", () => {
            const options: OptionsTest = {
                minify: {
                    compressor: yui,
                    input: filesJS.oneFile,
                    output: filesJS.fileJSOut,
                    sync: true,
                    options: {
                        fake: true,
                    },
                },
            };

            return expect(minify(options.minify)).rejects.toThrow();
        });
        afterAll(() => {
            vi.restoreAllMocks();
        });
    });

    describe("Create async errors", () => {
        beforeAll(() => {
            const spy = vi.spyOn(childProcess, "spawn");
            spy.mockImplementation(() => {
                throw new Error();
            });
        });
        test("should callback an error on spawn", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: yui,
                    input: filesJS.oneFile,
                    output: filesJS.fileJSOut,
                    sync: false,
                    options: {
                        fake: true,
                    },
                    callback: (): void => {
                        return;
                    },
                },
            };
            const spy = vi.spyOn(options.minify, "callback");

            expect(minify(options.minify)).rejects.toThrow();
            await minify(options.minify).catch(() =>
                expect(spy).toHaveBeenCalled()
            );
        });
        afterAll(() => {
            vi.restoreAllMocks();
        });
    });

    describe("Mandatory", () => {
        test("should show throw on type option", async () => {
            const options: OptionsTest = {
                minify: {
                    type: "uglifyjs",
                    input: filesJS.oneFileWithWildcards,
                    output: filesJS.fileJSOut,
                    callback: (): void => {
                        return;
                    },
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toEqual(
                    "Error: compressor is mandatory."
                );
            }
        });
    });

    describe("Should be OK", () => {
        test("should be OK with GCC and async", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: gcc,
                    input: filesJS.oneFile,
                    output: filesJS.fileJSOut,
                    callback: (): void => {
                        return;
                    },
                },
            };
            const spy = vi.spyOn(options.minify, "callback");

            const min = await minify(options.minify);
            expect(spy).toHaveBeenCalled();
            expect(min).toBeDefined();
        });
        test("should be OK with GCC and sync", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: gcc,
                    input: filesJS.oneFile,
                    output: filesJS.fileJSOut,
                    sync: true,
                    callback: (): void => {
                        return;
                    },
                },
            };
            const spy = vi.spyOn(options.minify, "callback");

            const min = await minify(options.minify);
            expect(spy).toHaveBeenCalled();
            expect(min).toBeDefined();
        });
    });

    describe("In Memory", () => {
        test("should be OK with html minifier and async", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: htmlMinifier,
                    content:
                        "<html lang='en'><body><div>content</div></body></html>",
                    callback: (): void => {
                        return;
                    },
                },
            };
            const spy = vi.spyOn(options.minify, "callback");

            const min = await minify(options.minify);
            expect(spy).toHaveBeenCalled();
            expect(min).toBeDefined();
        });

        test("should be OK with GCC and sync", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: htmlMinifier,
                    content:
                        "<html lang='en'><body><div>content</div></body></html>",
                    sync: true,
                    callback: (): void => {
                        return;
                    },
                },
            };
            const spy = vi.spyOn(options.minify, "callback");

            const min = await minify(options.minify);
            expect(spy).toHaveBeenCalled();
            expect(min).toBeDefined();
        });

        test("should throw an error if binary does not exist", async () => {
            const options: OptionsTest = {
                minify: {
                    compressor: "fake",
                    content:
                        "<html lang='en'><body><div>content</div></body></html>",
                },
            };

            try {
                return await minify(options.minify);
            } catch (err) {
                return expect(err.toString()).toEqual(
                    "Error: compressor should be a function, maybe you forgot to install the compressor"
                );
            }
        });
    });
});
