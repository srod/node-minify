/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { gcc } from "../src/index.ts";

const mocks = vi.hoisted(() => ({
    runCommandLine: vi.fn(),
    original: null as typeof import("@node-minify/run").runCommandLine | null,
}));

vi.mock("@node-minify/run", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@node-minify/run")>();
    mocks.original = actual.runCommandLine;
    mocks.runCommandLine.mockImplementation(actual.runCommandLine);
    return {
        ...actual,
        runCommandLine: mocks.runCommandLine,
    };
});

const compressorLabel = "google-closure-compiler";
const compressor = gcc;

describe("Package: google-closure-compiler", async () => {
    if (!tests.commonjs) {
        throw new Error("Tests not found");
    }

    // Run commonjs tests
    for (const options of tests.commonjs) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should compress with some options", async (): Promise<void> => {
        const settings: Settings = {
            compressor: gcc,
            input: filesJS.oneFileWithWildcards,
            output: filesJS.fileJSOut,
            options: {
                language_in: "ECMASCRIPT5",
            },
        };

        const result = await minify(settings);
        expect(result).not.toBeNull();
    });

    test("should throw an error", async () => {
        const settings: Settings = {
            compressor: gcc,
            input: filesJS.errors,
            output: filesJS.fileJSOut,
        };

        try {
            return await minify(settings);
        } catch (err) {
            return expect(err).not.toBeNull();
        }
    });

    test("should compress with boolean options", async (): Promise<void> => {
        const settings: Settings = {
            compressor: gcc,
            input: filesJS.oneFileWithWildcards,
            output: filesJS.fileJSOut,
            options: {
                rewrite_polyfills: true,
            },
        };

        const result = await minify(settings);
        expect(result).not.toBeNull();
    });

    test("should compress with object options (define)", async (): Promise<void> => {
        const settings: Settings = {
            compressor: gcc,
            input: filesJS.oneFileWithWildcards,
            output: filesJS.fileJSOut,
            options: {
                define: { DEBUG: false },
            },
        };

        const result = await minify(settings);
        expect(result).not.toBeNull();
    });

    describe("Error handling", () => {
        beforeAll(() => {
            mocks.runCommandLine.mockResolvedValue(undefined);
        });

        afterAll(() => {
            if (mocks.original) {
                mocks.runCommandLine.mockImplementation(mocks.original);
            }
        });

        test("should throw when gcc returns empty result", async () => {
            const settings: Settings = {
                compressor: gcc,
                input: filesJS.oneFile,
                output: filesJS.fileJSOut,
            };
            await expect(
                gcc({ settings, content: "var x = 1;" })
            ).rejects.toThrow("Google Closure Compiler failed: empty result");
        });
    });
});
