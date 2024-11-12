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
import minify from "../../core/src";
import yui from "../src";

const compressorLabel = "yui";
const compressor = yui;

describe("Package: YUI", async () => {
    // Run JS async tests
    for (const options of tests.commonjs) {
        options.minify.type = "js";
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run JS sync tests
    for (const options of tests.commonjs) {
        options.minify.type = "js";
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }

    // Run CSS async tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run CSS sync tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }

    test("should compress with some options", (): Promise<void> =>
        new Promise<void>((done) => {
            // const options: { minify: { callback?: Function } } = {};
            const options: OptionsTest = {
                minify: {
                    compressor: yui,
                    type: "js",
                    input: filesJS.oneFileWithWildcards,
                    output: filesJS.fileJSOut,
                    options: {
                        charset: "utf8",
                    },
                },
            };

            options.minify.callback = (err, min) => {
                expect(err).toBeNull();
                expect(min).not.toBeNull();

                done();
            };

            minify(options.minify);
        }));

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
    });
    afterAll(() => {
        vi.restoreAllMocks();
    });
});
