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
import { uglifyJs } from "../src/index.ts";

const compressorLabel = "uglify-js";
const compressor = uglifyJs;

describe("Package: uglify-js", async () => {
    if (!tests.commonjs || !tests.uglifyjs) {
        throw new Error("Tests not found");
    }

    // Run commonjs tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    for (const options of tests.uglifyjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should throw an error", async () => {
        const settings: Settings = {
            compressor: uglifyJs,
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
