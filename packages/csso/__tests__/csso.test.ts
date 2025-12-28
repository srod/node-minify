/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { csso } from "../src/index.ts";

const compressorLabel = "csso";
const compressor = csso;

describe("Package: csso", async () => {
    if (!tests.commoncss) {
        throw new Error("Tests not found");
    }

    // Run commoncss tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }
});
