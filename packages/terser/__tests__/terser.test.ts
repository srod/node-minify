/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { Options } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesJS } from "../../../tests/files-path";
import { runOneTest, tests } from "../../../tests/fixtures";
import minify from "../../core/src";
import terser from "../src";

const compressorLabel = "terser";
const compressor = terser;

describe("Package: terser", () => {
    tests.commonjs.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor });
    });
    tests.uglifyjs.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor });
    });
    tests.commonjs.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor, sync: true });
    });
    tests.uglifyjs.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor, sync: true });
    });
    test("should throw an error", () => {
        const options: Options = {
            minify: {
                compressor: terser,
                input: filesJS.errors,
                output: filesJS.fileJSOut,
            },
        };

        return minify(options.minify).catch((err) => {
            return expect(err).not.toBeNull();
        });
    });
});
