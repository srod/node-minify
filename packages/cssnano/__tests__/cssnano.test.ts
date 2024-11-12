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

describe("Package: cssnano", async () => {
    // Run async tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }
    test("should be ok with no callback", async () => {
        const options: OptionsTest = {
            minify: {
                compressor: cssnano,
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
            },
        };

        const min = await minify(options.minify);
        return expect(min).not.toBeNull();
    });
    test("should throw an error", async () => {
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

        try {
            return await minify(options.minify);
        } catch (err) {
            return expect(err).not.toBeNull();
        }
    });
});
