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
import { cleanCss } from "../src/index.ts";

const compressorLabel = "clean-css";
const compressor = cleanCss;

describe("Package: clean-css", async () => {
    if (!tests.commoncss) {
        throw new Error("Tests not found");
    }

    // Run commoncss tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should compress with some options", (): Promise<void> =>
        new Promise<void>((done) => {
            const settings: Settings = {
                compressor,
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
                options: {
                    sourceMap: {
                        filename: filesCSS.fileCSSSourceMaps,
                        url: filesCSS.fileCSSSourceMaps,
                    },
                },
            };
            settings.callback = (err, min) => {
                expect(err).toBeNull();
                expect(min).not.toBeNull();

                done();
            };

            minify(settings);
        }));
});
