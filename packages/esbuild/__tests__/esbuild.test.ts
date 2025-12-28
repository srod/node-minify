/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesCSS, filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { esbuild } from "../src/index.ts";

const compressorLabel = "esbuild";
const compressor = esbuild;

describe("Package: esbuild", async () => {
    describe("JavaScript", async () => {
        if (!tests.commonjs) {
            throw new Error("Tests not found");
        }

        for (const options of tests.commonjs) {
            const jsOptions = {
                ...options,
                minify: { ...options.minify, type: "js" as const },
            };
            await runOneTest({
                options: jsOptions,
                compressorLabel,
                compressor,
            });
        }

        test("should compress javascript with esbuild and create source map", async () => {
            const settings: Settings = {
                compressor: esbuild,
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
                type: "js",
                options: {
                    sourceMap: true,
                },
            };

            const min = await minify(settings);
            return expect(min).not.toBeNull();
        });

        test("should throw an error for invalid js", async () => {
            const settings: Settings = {
                compressor: esbuild,
                input: filesJS.errors,
                output: filesJS.fileJSOut,
                type: "js",
            };

            try {
                return await minify(settings);
            } catch (err) {
                return expect(err).not.toBeNull();
            }
        });
    });

    describe("CSS", async () => {
        if (!tests.commoncss) {
            throw new Error("Tests not found");
        }

        for (const options of tests.commoncss) {
            const cssOptions = {
                ...options,
                minify: { ...options.minify, type: "css" as const },
            };
            await runOneTest({
                options: cssOptions,
                compressorLabel,
                compressor,
            });
        }

        test("should compress css with esbuild", async () => {
            const settings: Settings = {
                compressor: esbuild,
                input: filesCSS.fileCSS,
                output: filesCSS.fileCSSOut,
                type: "css",
            };

            const min = await minify(settings);
            return expect(min).not.toBeNull();
        });
    });

    test("should throw an error if type is not specified", async () => {
        const settings: Settings = {
            compressor: esbuild,
            input: filesJS.oneFile,
            output: filesJS.fileJSOut,
        };

        try {
            return await minify(settings);
        } catch (err) {
            return expect(err).toBeInstanceOf(Error);
        }
    });
});
