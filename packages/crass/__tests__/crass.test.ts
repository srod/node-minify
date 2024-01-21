/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures";
import crass from "../src";

const compressorLabel = "crass";
const compressor = crass;

describe("Package: crass", () => {
    tests.commoncss.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor });
    });
    tests.commoncss.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor, sync: true });
    });
});
