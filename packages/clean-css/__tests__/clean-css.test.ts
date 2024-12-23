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
import cleanCss from "../src";

const compressorLabel = "clean-css";
const compressor = cleanCss;

describe("Package: clean-css", async () => {
    // Run async tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    // Run sync tests
    for (const options of tests.commoncss) {
        await runOneTest({ options, compressorLabel, compressor, sync: true });
    }

    test("should compress with some options", (): Promise<void> =>
        new Promise<void>((done) => {
            const options: OptionsTest = {
                minify: {
                    compressor,
                    input: filesCSS.fileCSS,
                    output: filesCSS.fileCSSOut,
                    options: {
                        sourceMap: {
                            filename: filesCSS.fileCSSSourceMaps,
                            url: filesCSS.fileCSSSourceMaps,
                        },
                    },
                },
            };
            options.minify.callback = (err, min) => {
                expect(err).toBeNull();
                expect(min).not.toBeNull();

                done();
            };

            minify(options.minify);
        }));
});
