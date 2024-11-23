/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { gcc } from "../src/index.ts";

const compressorLabel = "google-closure-compiler";
const compressor = gcc;

describe("Package: google-closure-compiler", async () => {
    if (!tests.commonjs) {
        throw new Error("Tests not found");
    }

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
            const settings: Settings = {
                compressor: gcc,
                input: filesJS.oneFileWithWildcards,
                output: filesJS.fileJSOut,
                options: {
                    language_in: "ECMASCRIPT5",
                },
            };

            settings.callback = (err, min) => {
                expect(err).toBeNull();
                expect(min).not.toBeNull();

                done();
            };

            minify(settings);
        }));

    test("should throw an error", async () => {
        const settings: Settings = {
            compressor: gcc,
            input: filesJS.errors,
            output: filesJS.fileJSOut,
        };

        try {
            return await minify(settings);
        } catch (err) {
            return expect(err).not.toBeNull();
        }
    });
});
