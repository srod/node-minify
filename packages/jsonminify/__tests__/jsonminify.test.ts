/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { jsonMinify } from "../src/index.ts";

const compressorLabel = "jsonminify";
const compressor = jsonMinify;

describe("Package: jsonminify", async () => {
    if (!tests.commonjson) {
        throw new Error("Tests not found");
    }

    // Run async tests
    for (const options of tests.commonjson) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    // for (const options of tests.commonjson) {
    //     await runOneTest({ options, compressorLabel, compressor, sync: true });
    // }
});
