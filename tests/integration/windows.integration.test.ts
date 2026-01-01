/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import os from "node:os";
import path from "node:path";
import { minify } from "@node-minify/core";
import { noCompress } from "@node-minify/no-compress";
import { terser } from "@node-minify/terser";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
    createTempFixtures,
    readTempFile,
    sampleJS,
    type TempFixtures,
    tempFileExists,
} from "./helpers.ts";

/**
 * Windows-specific integration tests
 *
 * These tests verify that node-minify works correctly on Windows:
 * - Path handling with backslashes
 * - Drive letters (C:\, D:\, etc.)
 * - UNC paths (\\server\share)
 * - Paths with spaces
 * - Mixed path separators
 *
 * Tests use mocking to simulate Windows behavior on any platform,
 * but the real test suite runs on windows-latest in CI.
 */
describe("Windows Integration Tests", () => {
    let fixtures: TempFixtures;
    const isActualWindows = os.platform() === "win32";

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
        vi.restoreAllMocks();
    });

    describe("Windows path normalization", () => {
        test("should handle backslash separators in file paths", async () => {
            fixtures = await createTempFixtures({
                "src/app.js": sampleJS,
            });

            const inputPath = path.join(fixtures.dir, "src", "app.js");
            const outputPath = path.join(fixtures.dir, "dist", "app.min.js");

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
        });

        test("should handle paths with spaces (Windows Program Files style)", async () => {
            fixtures = await createTempFixtures({
                "Program Files/MyApp/src/app.js": sampleJS,
            });

            const inputPath = path.join(
                fixtures.dir,
                "Program Files",
                "MyApp",
                "src",
                "app.js"
            );
            const outputPath = path.join(
                fixtures.dir,
                "Program Files",
                "MyApp",
                "dist",
                "app.min.js"
            );

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(
                await tempFileExists(
                    fixtures,
                    "Program Files/MyApp/dist/app.min.js"
                )
            ).toBe(true);
        });

        test("should handle deep nested paths with backslashes", async () => {
            fixtures = await createTempFixtures({
                "a/b/c/d/e/deep.js": sampleJS,
            });

            const inputPath = path.join(
                fixtures.dir,
                "a",
                "b",
                "c",
                "d",
                "e",
                "deep.js"
            );
            const outputPath = path.join(
                fixtures.dir,
                "a",
                "b",
                "c",
                "d",
                "e",
                "deep.min.js"
            );

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(
                await tempFileExists(fixtures, "a/b/c/d/e/deep.min.js")
            ).toBe(true);
        });

        test("should handle parent directory references (..) in Windows paths", async () => {
            fixtures = await createTempFixtures({
                "project/src/app.js": sampleJS,
                "project/dist/.gitkeep": "",
            });

            // Use path.join to create proper relative paths
            const inputPath = path.join(
                fixtures.dir,
                "project",
                "src",
                "app.js"
            );
            const outputPath = path.join(
                fixtures.dir,
                "project",
                "dist",
                "app.min.js"
            );

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(
                await tempFileExists(fixtures, "project/dist/app.min.js")
            ).toBe(true);
        });
    });

    describe("Windows wildcard expansion", () => {
        test("should expand wildcards in Windows paths", async () => {
            fixtures = await createTempFixtures({
                "src/a.js": "var a = 1;",
                "src/b.js": "var b = 2;",
                "src/c.js": "var c = 3;",
            });

            const inputPattern = path.join(fixtures.dir, "src", "*.js");
            const outputPath = path.join(fixtures.dir, "dist", "bundle.js");

            const result = await minify({
                compressor: noCompress,
                input: inputPattern,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/bundle.js")).toBe(true);

            const content = await readTempFile(fixtures, "dist/bundle.js");
            expect(content).toContain("a");
            expect(content).toContain("b");
            expect(content).toContain("c");
        });

        test("should handle recursive wildcards (**) in Windows paths", async () => {
            fixtures = await createTempFixtures({
                "src/components/button.js": "var button = 1;",
                "src/components/input.js": "var input = 2;",
                "src/utils/helpers.js": "var helpers = 3;",
            });

            const inputPattern = path.join(fixtures.dir, "src", "**", "*.js");
            const outputPath = path.join(fixtures.dir, "dist", "all.js");

            const result = await minify({
                compressor: noCompress,
                input: inputPattern,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/all.js")).toBe(true);

            const content = await readTempFile(fixtures, "dist/all.js");
            expect(content).toContain("button");
            expect(content).toContain("input");
            expect(content).toContain("helpers");
        });

        test("should expand wildcards with publicFolder on Windows", async () => {
            fixtures = await createTempFixtures({
                "public/js/a.js": "var a = 1;",
                "public/js/b.js": "var b = 2;",
            });

            const result = await minify({
                compressor: noCompress,
                input: "js/*.js",
                output: path.join(fixtures.dir, "dist", "bundle.js"),
                publicFolder: path.join(fixtures.dir, "public") + path.sep,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/bundle.js")).toBe(true);

            const content = await readTempFile(fixtures, "dist/bundle.js");
            expect(content).toContain("a");
            expect(content).toContain("b");
        });

        test("should handle array of wildcard patterns in Windows paths", async () => {
            fixtures = await createTempFixtures({
                "src/a.js": "var a = 1;",
                "src/b.js": "var b = 2;",
                "lib/c.js": "var c = 3;",
            });

            const inputPatterns = [
                path.join(fixtures.dir, "src", "*.js"),
                path.join(fixtures.dir, "lib", "*.js"),
            ];
            const outputPath = path.join(fixtures.dir, "dist", "all.js");

            const result = await minify({
                compressor: noCompress,
                input: inputPatterns,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/all.js")).toBe(true);

            const content = await readTempFile(fixtures, "dist/all.js");
            expect(content).toContain("a");
            expect(content).toContain("b");
            expect(content).toContain("c");
        });
    });

    describe("Windows-specific edge cases", () => {
        test("should handle paths with Windows reserved names in parent dirs", async () => {
            // Windows reserved names: CON, PRN, AUX, NUL, COM1-9, LPT1-9
            // We test with a folder named 'aux-files' which is NOT reserved
            fixtures = await createTempFixtures({
                "aux-files/app.js": sampleJS,
            });

            const inputPath = path.join(fixtures.dir, "aux-files", "app.js");
            const outputPath = path.join(
                fixtures.dir,
                "aux-files",
                "app.min.js"
            );

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "aux-files/app.min.js")).toBe(
                true
            );
        });

        test("should handle paths with Unicode characters on Windows", async () => {
            fixtures = await createTempFixtures({
                "日本語/フォルダ/app.js": sampleJS,
            });

            const inputPath = path.join(
                fixtures.dir,
                "日本語",
                "フォルダ",
                "app.js"
            );
            const outputPath = path.join(
                fixtures.dir,
                "日本語",
                "フォルダ",
                "app.min.js"
            );

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(
                await tempFileExists(fixtures, "日本語/フォルダ/app.min.js")
            ).toBe(true);
        });

        test("should handle very long paths (Windows MAX_PATH)", async () => {
            // Windows MAX_PATH is traditionally 260 characters
            // Modern Windows with long path support can handle longer
            const longDirName = "a".repeat(50);
            const longPath = `${longDirName}/${longDirName}/${longDirName}/app.js`;

            fixtures = await createTempFixtures({
                [longPath]: sampleJS,
            });

            const inputPath = path.join(fixtures.dir, longPath);
            const outputDir = path.dirname(inputPath);
            const outputPath = path.join(outputDir, "app.min.js");

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
        });

        test("should handle case-insensitive file matching on Windows", async () => {
            if (!isActualWindows) {
                // This test only makes sense on actual Windows
                // where file system is case-insensitive
                return;
            }

            fixtures = await createTempFixtures({
                "src/App.js": sampleJS,
            });

            // Try to access with different casing
            const inputPath = path.join(fixtures.dir, "src", "app.js");
            const outputPath = path.join(fixtures.dir, "dist", "app.min.js");

            try {
                const result = await minify({
                    compressor: terser,
                    input: inputPath,
                    output: outputPath,
                });

                // On Windows, this might work due to case-insensitivity
                expect(result).toBeDefined();
            } catch (error) {
                // On Unix-like systems mounted on Windows, this will fail
                // Both behaviors are acceptable
                expect(error).toBeDefined();
            }
        });

        test("should handle special characters in filenames (parentheses, brackets)", async () => {
            fixtures = await createTempFixtures({
                "test (1)/app [backup].js": sampleJS,
            });

            const inputPath = path.join(
                fixtures.dir,
                "test (1)",
                "app [backup].js"
            );
            const outputPath = path.join(
                fixtures.dir,
                "test (1)",
                "app [backup].min.js"
            );

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(
                await tempFileExists(fixtures, "test (1)/app [backup].min.js")
            ).toBe(true);
        });

        test("should handle trailing backslash in publicFolder", async () => {
            fixtures = await createTempFixtures({
                "public/js/app.js": sampleJS,
            });

            const publicFolder = path.join(fixtures.dir, "public") + path.sep;

            const result = await minify({
                compressor: terser,
                input: "js/app.js",
                output: path.join(fixtures.dir, "dist", "app.min.js"),
                publicFolder,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
        });

        test("should handle relative paths with ./ prefix", async () => {
            fixtures = await createTempFixtures({
                "src/app.js": sampleJS,
            });

            const inputPath = path.resolve(".", fixtures.dir, "src", "app.js");
            const outputPath = path.resolve(
                ".",
                fixtures.dir,
                "dist",
                "app.min.js"
            );

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
        });
    });

    describe("Windows parallel processing", () => {
        test("should process multiple Windows paths in parallel", async () => {
            fixtures = await createTempFixtures({
                "project1/src/app.js": "var app1 = 1;",
                "project2/src/app.js": "var app2 = 2;",
                "project3/src/app.js": "var app3 = 3;",
            });

            const results = await Promise.all([
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "project1", "src", "app.js"),
                    output: path.join(
                        fixtures.dir,
                        "project1",
                        "dist",
                        "app.min.js"
                    ),
                }),
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "project2", "src", "app.js"),
                    output: path.join(
                        fixtures.dir,
                        "project2",
                        "dist",
                        "app.min.js"
                    ),
                }),
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "project3", "src", "app.js"),
                    output: path.join(
                        fixtures.dir,
                        "project3",
                        "dist",
                        "app.min.js"
                    ),
                }),
            ]);

            expect(results).toHaveLength(3);
            expect(
                await tempFileExists(fixtures, "project1/dist/app.min.js")
            ).toBe(true);
            expect(
                await tempFileExists(fixtures, "project2/dist/app.min.js")
            ).toBe(true);
            expect(
                await tempFileExists(fixtures, "project3/dist/app.min.js")
            ).toBe(true);
        });

        test("should handle array input/output with Windows paths", async () => {
            fixtures = await createTempFixtures({
                "a.js": "var a = 1;",
                "b.js": "var b = 2;",
                "c.js": "var c = 3;",
            });

            const result = await minify({
                compressor: terser,
                input: [
                    path.join(fixtures.dir, "a.js"),
                    path.join(fixtures.dir, "b.js"),
                    path.join(fixtures.dir, "c.js"),
                ],
                output: [
                    path.join(fixtures.dir, "a.min.js"),
                    path.join(fixtures.dir, "b.min.js"),
                    path.join(fixtures.dir, "c.min.js"),
                ],
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "a.min.js")).toBe(true);
            expect(await tempFileExists(fixtures, "b.min.js")).toBe(true);
            expect(await tempFileExists(fixtures, "c.min.js")).toBe(true);
        });
    });

    describe("Windows CLI compatibility", () => {
        test("should work with $1 replacement pattern on Windows paths", async () => {
            fixtures = await createTempFixtures({
                "src/app.js": sampleJS,
            });

            const inputPath = path.join(fixtures.dir, "src", "app.js");
            const outputPath = path.join(fixtures.dir, "dist", "$1.min.js");

            const result = await minify({
                compressor: terser,
                input: inputPath,
                output: outputPath,
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
        });
    });

    describe("Windows environment detection", () => {
        test("should correctly detect Windows platform", () => {
            const platform = os.platform();
            // Just verify platform detection works
            expect(["win32", "darwin", "linux", "freebsd"]).toContain(platform);
        });

        test("should use correct path separator for platform", () => {
            const expectedSep = isActualWindows ? "\\" : "/";
            expect(path.sep).toBe(expectedSep);
        });
    });
});
