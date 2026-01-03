/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minifyHtml } from "../src/index.ts";

const compressorLabel = "minify-html";
const compressor = minifyHtml;

describe("Package: minify-html", async () => {
    if (!tests.commonhtml) {
        throw new Error("Tests not found");
    }

    for (const options of tests.commonhtml) {
        await runOneTest({ options, compressorLabel, compressor });
    }
});
