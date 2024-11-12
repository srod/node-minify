/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures";
import babelMinify from "../src";

const compressorLabel = "babel-minify";
const compressor = babelMinify;

describe("Package: babel-minify", async () => {
    // Run commonjs async tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run babelMinify async tests
    for (const options of tests.babelMinify) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run commonjs sync tests
    for (const options of tests.commonjs) {
        await runOneTest({
            options,
            compressorLabel,
            compressor,
            sync: true,
        });
    }

    // Run babelMinify sync tests
    for (const options of tests.babelMinify) {
        await runOneTest({
            options,
            compressorLabel,
            compressor,
            sync: true,
        });
    }
});
