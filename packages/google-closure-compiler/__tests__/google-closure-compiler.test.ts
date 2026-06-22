/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { Settings } from "@node-minify/types";
import { describe, expect, test } from "vitest";
import { filesJS } from "../../../tests/files-path.ts";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { minify } from "../../core/src/index.ts";
import { gcc } from "../src/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const distEntry = path.join(packageRoot, "dist", "index.js");
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

    test("should compress in-memory content", async (): Promise<void> => {
        const result = await gcc({
            settings: { compressor: gcc },
            content: "var x = 1; var y = 2;",
        });

        expect(result.code).toBeDefined();
        expect(typeof result.code).toBe("string");
        expect(result.code.length).toBeGreaterThan(0);
    });

    test("should load the built package in Node", () => {
        execFileSync("bun", ["run", "build"], {
            cwd: packageRoot,
            stdio: "pipe",
        });

        expect(() => {
            execFileSync(
                "node",
                [
                    "--input-type=module",
                    "-e",
                    `await import(${JSON.stringify(pathToFileURL(distEntry).href)});`,
                ],
                {
                    cwd: packageRoot,
                    stdio: "pipe",
                }
            );
        }).not.toThrow();
    }, 60000);

    test("should honor the configured buffer limit", async () => {
        await expect(
            gcc({
                settings: { compressor: gcc, buffer: 1 },
                content: "var x = 1; var y = 2;",
            })
        ).rejects.toThrow("maxBuffer exceeded");
    }, 60000);

    test("should throw on invalid JavaScript", async () => {
        await expect(
            gcc({
                settings: { compressor: gcc },
                content: "function( {{{ invalid",
            })
        ).rejects.toThrow();
    });

    test("should timeout with very short timeout", async () => {
        await expect(
            gcc({
                settings: { compressor: gcc, timeout: 1 },
                content:
                    "var x = 1; var y = 2; var z = 3; function foo() { return x + y + z; }",
            })
        ).rejects.toThrow("timed out");
    }, 60000);

    test("should suppress stderr details when silence is true", async () => {
        const promise = gcc({
            settings: { compressor: gcc, silence: true },
            content: "function( {{{ invalid",
        });
        // Must reject; with silence the message keeps the exit code but drops stderr detail.
        await expect(promise).rejects.toThrow("exited with code");
        await expect(promise).rejects.not.toThrow("ERROR -");
    }, 60000);
});
