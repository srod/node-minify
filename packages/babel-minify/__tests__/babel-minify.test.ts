/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { babelMinify } from "../src/index.ts";

const compressorLabel = "babel-minify";
const compressor = babelMinify;

describe("Package: babel-minify", async () => {
    if (!tests.commonjs || !tests.babelMinify) {
        throw new Error("Tests not found");
    }

    // Run commonjs tests
    for (const options of tests.commonjs) {
        await runOneTest({
            options,
            compressorLabel,
            compressor,
        });
    }

    // Run babelMinify tests
    for (const options of tests.babelMinify) {
        await runOneTest({ options, compressorLabel, compressor });
    }
});
