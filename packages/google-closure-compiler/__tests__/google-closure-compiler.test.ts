/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { OptionsTest } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesJS } from "../../../tests/files-path";
import { runOneTest, tests } from "../../../tests/fixtures";
import { minify } from "../../core/src";
import gcc from "../src";

const compressorLabel = "google-closure-compiler";
const compressor = gcc;

describe("Package: google-closure-compiler", async () => {
    // Run async tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }

    test("should compress with some options", (): Promise<void> =>
        new Promise<void>((done) => {
            const options: OptionsTest = {
                minify: {
                    compressor: gcc,
                    input: filesJS.oneFileWithWildcards,
                    output: filesJS.fileJSOut,
                    options: {
                        language_in: "ECMASCRIPT5",
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
    test("should throw an error", async () => {
        const options: OptionsTest = {
            minify: {
                compressor: gcc,
                input: filesJS.errors,
                output: filesJS.fileJSOut,
            },
        };

        try {
            return await minify(options.minify);
        } catch (err) {
            return expect(err).not.toBeNull();
        }
    });
});
