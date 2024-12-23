/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { OptionsTest } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesJS } from "../../../tests/files-path";
import { runOneTest, tests } from "../../../tests/fixtures";
import minify from "../../core/src";
import uglifyes from "../src";

const compressorLabel = "uglify-es";
const compressor = uglifyes;

describe("Package: uglify-es", async () => {
    // Run async tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    for (const options of tests.uglifyjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }

    for (const options of tests.uglifyjs) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }

    test("should throw an error", async () => {
        const options: OptionsTest = {
            minify: {
                compressor: uglifyes,
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
