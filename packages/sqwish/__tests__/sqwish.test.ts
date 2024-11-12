/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures";
import sqwish from "../src";

const compressorLabel = "sqwish";
const compressor = sqwish;

describe("Package: sqwish", async () => {
    // Run async tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }
});
