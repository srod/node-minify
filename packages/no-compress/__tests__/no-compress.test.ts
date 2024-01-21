/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures";
import noCompress from "../src";

const compressorLabel = "no-compress";
const compressor = noCompress;

describe("Package: no-compress", () => {
    tests.concat.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor });
    });
    tests.concat.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor, sync: true });
    });
});
