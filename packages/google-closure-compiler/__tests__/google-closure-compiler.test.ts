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

    // Run commonjs tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should compress with some options", async (): Promise<void> => {
        const settings: Settings = {
            compressor: gcc,
            input: filesJS.oneFileWithWildcards,
            output: filesJS.fileJSOut,
            options: {
                language_in: "ECMASCRIPT5",
            },
        };

        const result = await minify(settings);
        expect(result).not.toBeNull();
    });

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
