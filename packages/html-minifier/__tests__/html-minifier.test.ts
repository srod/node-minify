/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { htmlMinifier } from "../src/index.ts";

const compressorLabel = "html-minifier";
const compressor = htmlMinifier;

describe("Package: html-minifier", async () => {
    if (!tests.commonhtml) {
        throw new Error("Tests not found");
    }

    // Run commonhtml tests
    for (const options of tests.commonhtml) {
        await runOneTest({ options, compressorLabel, compressor });
    }
});
