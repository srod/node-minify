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

    // Run commoncss tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should be ok", async () => {
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
        };

        try {
            return await minify(settings);
        } catch (err) {
            return expect(err).not.toBeNull();
        }
    });
});
