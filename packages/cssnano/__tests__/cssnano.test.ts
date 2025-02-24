/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesCSS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { cssnano } from "../src/index.ts";

const compressorLabel = "cssnano";
const compressor = cssnano;

describe("Package: cssnano", async () => {
    if (!tests.commoncss) {
        throw new Error("Tests not found");
    }

    // Run async tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    // for (const options of tests.commoncss) {
    //     await runOneTest({ options, compressorLabel, compressor, sync: true });
    // }

    test("should be ok with no callback", async () => {
        const settings: Settings = {
            compressor: cssnano,
            input: filesCSS.fileCSS,
            output: filesCSS.fileCSSOut,
        };

        const min = await minify(settings);
        return expect(min).not.toBeNull();
    });
    test("should throw an error", async () => {
        const settings: Settings = {
            compressor: cssnano,
            input: filesCSS.fileCSSErrors,
            output: filesCSS.fileCSSOut,
            callback: (): void => {
                return;
            },
        };

        try {
            return await minify(settings);
        } catch (err) {
            return expect(err).not.toBeNull();
        }
    });
});
