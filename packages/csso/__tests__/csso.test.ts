/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures";
import csso from "../src";

const compressorLabel = "csso";
const compressor = csso;

describe("Package: csso", () => {
    tests.commoncss.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor });
    });
    tests.commoncss.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor, sync: true });
    });
});
