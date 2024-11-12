/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures";
import jsonminify from "../src";

const compressorLabel = "jsonminify";
const compressor = jsonminify;

describe("Package: jsonminify", async () => {
    // Run async tests
    for (const options of tests.commonjson) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commonjson) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }
});
