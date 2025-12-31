/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "vitest";
import { minify } from "@node-minify/core";
import { cleanCss } from "@node-minify/clean-css";
import { terser } from "@node-minify/terser";
import { htmlMinifier } from "@node-minify/html-minifier";
import { noCompress } from "@node-minify/no-compress";
import {
    createTempFixtures,
    readTempFile,
    sampleCSS,
    sampleHTML,
    sampleJS,
    tempFileExists,
    type TempFixtures,
} from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Workflow Integration Tests", () => {
    let fixtures: TempFixtures;

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
    });

    describe("Multi-asset pipeline", () => {
        test("should minify JS and CSS in sequence", async () => {
            fixtures = await createTempFixtures({
                "src/app.js": sampleJS,
                "src/styles.css": sampleCSS,
            });

            const jsResult = await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "src/app.js"),
                output: path.join(fixtures.dir, "dist/app.min.js"),
            });

            const cssResult = await minify({
                compressor: cleanCss,
                input: path.join(fixtures.dir, "src/styles.css"),
                output: path.join(fixtures.dir, "dist/styles.min.css"),
            });

            expect(jsResult).toBeDefined();
            expect(cssResult).toBeDefined();

            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
            expect(await tempFileExists(fixtures, "dist/styles.min.css")).toBe(
                true
            );

            const minifiedJS = await readTempFile(fixtures, "dist/app.min.js");
            const minifiedCSS = await readTempFile(
                fixtures,
                "dist/styles.min.css"
            );

            expect(minifiedJS.length).toBeLessThan(sampleJS.length);
            expect(minifiedCSS.length).toBeLessThan(sampleCSS.length);
        });

        test("should minify JS, CSS, and HTML in sequence", async () => {
            fixtures = await createTempFixtures({
                "src/app.js": sampleJS,
                "src/styles.css": sampleCSS,
                "src/index.html": sampleHTML,
            });

            await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "src/app.js"),
                output: path.join(fixtures.dir, "dist/app.min.js"),
            });

            await minify({
                compressor: cleanCss,
                input: path.join(fixtures.dir, "src/styles.css"),
                output: path.join(fixtures.dir, "dist/styles.min.css"),
            });

            await minify({
                compressor: htmlMinifier,
                input: path.join(fixtures.dir, "src/index.html"),
                output: path.join(fixtures.dir, "dist/index.min.html"),
            });

            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
            expect(await tempFileExists(fixtures, "dist/styles.min.css")).toBe(
                true
            );
            expect(await tempFileExists(fixtures, "dist/index.min.html")).toBe(
                true
            );
        });
    });

    describe("Parallel compression", () => {
        test("should compress multiple JS files in parallel", async () => {
            fixtures = await createTempFixtures({
                "src/a.js": "function a() { return 1; }",
                "src/b.js": "function b() { return 2; }",
                "src/c.js": "function c() { return 3; }",
            });

            const results = await Promise.all([
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "src/a.js"),
                    output: path.join(fixtures.dir, "dist/a.min.js"),
                }),
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "src/b.js"),
                    output: path.join(fixtures.dir, "dist/b.min.js"),
                }),
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "src/c.js"),
                    output: path.join(fixtures.dir, "dist/c.min.js"),
                }),
            ]);

            expect(results).toHaveLength(3);
            expect(await tempFileExists(fixtures, "dist/a.min.js")).toBe(true);
            expect(await tempFileExists(fixtures, "dist/b.min.js")).toBe(true);
            expect(await tempFileExists(fixtures, "dist/c.min.js")).toBe(true);
        });

        test("should compress JS and CSS in parallel", async () => {
            fixtures = await createTempFixtures({
                "app.js": sampleJS,
                "styles.css": sampleCSS,
            });

            const [jsResult, cssResult] = await Promise.all([
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "app.js"),
                    output: path.join(fixtures.dir, "app.min.js"),
                }),
                minify({
                    compressor: cleanCss,
                    input: path.join(fixtures.dir, "styles.css"),
                    output: path.join(fixtures.dir, "styles.min.css"),
                }),
            ]);

            expect(jsResult).toBeDefined();
            expect(cssResult).toBeDefined();
        });

        test("should handle partial failures with Promise.allSettled", async () => {
            fixtures = await createTempFixtures({
                "valid.js": "function valid() { return true; }",
            });

            const results = await Promise.allSettled([
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "valid.js"),
                    output: path.join(fixtures.dir, "valid.min.js"),
                }),
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "nonexistent.js"),
                    output: path.join(fixtures.dir, "nonexistent.min.js"),
                }),
            ]);

            expect(results[0].status).toBe("fulfilled");
            expect(results[1].status).toBe("rejected");
            expect(await tempFileExists(fixtures, "valid.min.js")).toBe(true);
        });
    });

    describe("In-memory processing", () => {
        test("should process in-memory and return result", async () => {
            const result = await minify({
                compressor: terser,
                content: sampleJS,
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect(result.length).toBeLessThan(sampleJS.length);
        });

        test("should process in-memory CSS", async () => {
            const result = await minify({
                compressor: cleanCss,
                content: sampleCSS,
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
            expect(result.length).toBeLessThan(sampleCSS.length);
        });

        test("should process in-memory and write to file", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            const result = await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "input.js"),
                output: path.join(fixtures.dir, "output.min.js"),
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "output.min.js")).toBe(true);

            const fileContent = await readTempFile(fixtures, "output.min.js");
            expect(fileContent.length).toBeLessThan(sampleJS.length);
        });
    });

    describe("Public folder workflow", () => {
        test("should use publicFolder with relative input paths", async () => {
            fixtures = await createTempFixtures({
                "public/js/app.js": sampleJS,
            });

            const result = await minify({
                compressor: terser,
                input: "js/app.js",
                output: path.join(fixtures.dir, "dist/app.min.js"),
                publicFolder: path.join(fixtures.dir, "public/"),
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
        });

        test("should use publicFolder with wildcards", async () => {
            fixtures = await createTempFixtures({
                "public/js/a.js": "var a = 1;",
                "public/js/b.js": "var b = 2;",
            });

            const result = await minify({
                compressor: noCompress,
                input: "js/*.js",
                output: path.join(fixtures.dir, "dist/bundle.js"),
                publicFolder: path.join(fixtures.dir, "public/"),
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "dist/bundle.js")).toBe(true);
        });
    });

    describe("Array input/output", () => {
        test("should process array of inputs to array of outputs", async () => {
            fixtures = await createTempFixtures({
                "a.js": "function a() { return 1; }",
                "b.js": "function b() { return 2; }",
            });

            const result = await minify({
                compressor: terser,
                input: [
                    path.join(fixtures.dir, "a.js"),
                    path.join(fixtures.dir, "b.js"),
                ],
                output: [
                    path.join(fixtures.dir, "a.min.js"),
                    path.join(fixtures.dir, "b.min.js"),
                ],
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "a.min.js")).toBe(true);
            expect(await tempFileExists(fixtures, "b.min.js")).toBe(true);
        });

        test("should concatenate array of inputs to single output", async () => {
            fixtures = await createTempFixtures({
                "a.js": "var a = 1;",
                "b.js": "var b = 2;",
            });

            const result = await minify({
                compressor: terser,
                input: [
                    path.join(fixtures.dir, "a.js"),
                    path.join(fixtures.dir, "b.js"),
                ],
                output: path.join(fixtures.dir, "bundle.min.js"),
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "bundle.min.js")).toBe(true);

            const content = await readTempFile(fixtures, "bundle.min.js");
            expect(content).toContain("a");
            expect(content).toContain("b");
        });
    });

    describe("Source map generation", () => {
        test("should generate source map with terser", async () => {
            fixtures = await createTempFixtures({
                "app.js": sampleJS,
            });

            const outputPath = path.join(fixtures.dir, "app.min.js");

            await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "app.js"),
                output: outputPath,
                options: {
                    sourceMap: {
                        url: "inline",
                    },
                } as Record<string, unknown>,
            });

            expect(await tempFileExists(fixtures, "app.min.js")).toBe(true);

            const minifiedContent = await readTempFile(fixtures, "app.min.js");
            expect(minifiedContent).toContain("sourceMappingURL");
        });
    });

    describe("$1 output pattern", () => {
        test("should use $1 pattern for output naming", async () => {
            fixtures = await createTempFixtures({
                "src/app.js": sampleJS,
            });

            await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "src/app.js"),
                output: path.join(fixtures.dir, "dist/$1.min.js"),
            });

            expect(await tempFileExists(fixtures, "dist/app.min.js")).toBe(
                true
            );
        });
    });

    describe("Error recovery", () => {
        test("should not leave partial files on compression error", async () => {
            fixtures = await createTempFixtures({
                "invalid.js": "function { broken syntax",
            });

            try {
                await minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "invalid.js"),
                    output: path.join(fixtures.dir, "invalid.min.js"),
                });
            } catch {
                // Expected to fail
            }

            // Output file should not exist or be empty
            const exists = await tempFileExists(fixtures, "invalid.min.js");
            if (exists) {
                const content = await readTempFile(fixtures, "invalid.min.js");
                expect(content.trim()).toBe("");
            }
        });
    });
});
