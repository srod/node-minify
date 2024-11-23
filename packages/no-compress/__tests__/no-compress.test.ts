/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { noCompress } from "../src/index.ts";

const compressorLabel = "no-compress";
const compressor = noCompress;

describe("Package: no-compress", async () => {
    if (!tests.concat) {
        throw new Error("Tests not found");
    }

    // Run async tests
    for (const options of tests.concat) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.concat) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }
});
