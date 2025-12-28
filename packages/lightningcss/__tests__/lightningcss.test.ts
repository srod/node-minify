/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesCSS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { lightningCss } from "../src/index.ts";

const compressorLabel = "lightningcss";
const compressor = lightningCss;

describe("Package: lightningcss", async () => {
    if (!tests.commoncss) {
        throw new Error("Tests not found");
    }

    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should compress css with lightningcss", async () => {
        const settings: Settings = {
            compressor: lightningCss,
            input: filesCSS.fileCSS,
            output: filesCSS.fileCSSOut,
        };

        const min = await minify(settings);
        return expect(min).not.toBeNull();
    });

    test("should compress css with lightningcss and create source map", async () => {
        const settings: Settings = {
            compressor: lightningCss,
            input: filesCSS.fileCSS,
            output: filesCSS.fileCSSOut,
            options: {
                sourceMap: true,
            },
        };

        const min = await minify(settings);
        return expect(min).not.toBeNull();
    });

    test("should throw an error for invalid css", async () => {
        const settings: Settings = {
            compressor: lightningCss,
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
