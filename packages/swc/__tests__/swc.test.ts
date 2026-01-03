/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { swc } from "../src/index.ts";

const compressorLabel = "swc";
const compressor = swc;

describe("Package: swc", async () => {
    if (!tests.commonjs) {
        throw new Error("Tests not found");
    }

    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should compress javascript with swc and create source map", async () => {
        const settings: Settings = {
            compressor: swc,
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
            options: {
                sourceMap: true,
            },
        };

        const min = await minify(settings);
        return expect(min).not.toBeNull();
    });

    test("should throw an error for invalid js", async () => {
        const settings: Settings = {
            compressor: swc,
            input: filesJS.errors,
            output: filesJS.fileJSOut,
        };

        try {
            return await minify(settings);
        } catch (err) {
            return expect(err).not.toBeNull();
        }
    });
});
