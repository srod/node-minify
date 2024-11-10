/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { OptionsTest } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesCSS } from "../../../tests/files-path";
import { runOneTest, tests } from "../../../tests/fixtures";
import minify from "../../core/src";
import cssnano from "../src";

const compressorLabel = "cssnano";
const compressor = cssnano;

describe("Package: cssnano", () => {
    tests.commoncss.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor });
    });
    tests.commoncss.forEach((options) => {
        runOneTest({ options, compressorLabel, compressor, sync: true });
    });
    test("should be ok with no callback", () => {
        const options: OptionsTest = {
            minify: {
                compressor: cssnano,
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
            },
        };

        return minify(options.minify).then((min) => {
            return expect(min).not.toBeNull();
        });
    });
    test("should throw an error", () => {
        const options: OptionsTest = {
            minify: {
                compressor: cssnano,
                input: filesCSS.fileCSSErrors,
                output: filesCSS.fileCSSOut,
                callback: (): void => {
                    return;
                },
            },
        };

        return minify(options.minify).catch((err) => {
            return expect(err).not.toBeNull();
        });
    });
});
