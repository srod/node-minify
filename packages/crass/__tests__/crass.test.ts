/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { crass } from "../src/index.ts";

const compressorLabel = "crass";
const compressor = crass;

describe("Package: crass", async () => {
    if (!tests.commoncss) {
        throw new Error("Tests not found");
    }

    // Run commoncss tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }
});
