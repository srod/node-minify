/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { OptionsTest } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesJS } from "../../../tests/files-path";
import { runOneTest, tests } from "../../../tests/fixtures";
import minify from "../../core/src";
import uglifyes from "../src";

const compressorLabel = "uglify-es";
const compressor = uglifyes;

describe("Package: uglify-es", () => {
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
        const options: OptionsTest = {
            minify: {
                compressor: uglifyes,
                input: filesJS.errors,
                output: filesJS.fileJSOut,
            },
        };

        return minify(options.minify).catch((err) => {
            return expect(err).not.toBeNull();
        });
    });
});
