/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { sqwish } from "../src/index.ts";

const compressorLabel = "sqwish";
const compressor = sqwish;

describe("Package: sqwish", async () => {
    if (!tests.commoncss) {
        throw new Error("Tests not found");
    }

    // Run async tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }
});
