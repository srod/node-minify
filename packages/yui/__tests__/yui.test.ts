/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import type { Settings } from "@node-minify/types";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { yui } from "../src/index.ts";

const compressorLabel = "yui";
const compressor = yui;

describe("Package: YUI", async () => {
    if (!tests.commonjs || !tests.commoncss) {
        throw new Error("Tests not found");
    }

    // Run commonjs tests
    for (const options of tests.commonjs) {
        options.minify.type = "js";
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run commoncss tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should compress with some options", async (): Promise<void> => {
        const settings: Settings = {
            compressor: yui,
            type: "js",
            input: filesJS.oneFileWithWildcards,
            output: filesJS.fileJSOut,
            options: {
                charset: "utf8",
            },
        };

        const result = await minify(settings);
        expect(result).not.toBeNull();
    });

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
            try {
                await minify(settings);
            } catch (err) {
                return expect(err).not.toBeNull();
            }
        });
    });
    afterAll(() => {
        vi.restoreAllMocks();
    });
});
