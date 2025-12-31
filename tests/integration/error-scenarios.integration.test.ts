/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, test } from "vitest";
import { minify } from "@node-minify/core";
import { terser } from "@node-minify/terser";
import { cleanCss } from "@node-minify/clean-css";
import { htmlMinifier } from "@node-minify/html-minifier";
import { jsonMinify } from "@node-minify/jsonminify";
import { noCompress } from "@node-minify/no-compress";
import {
    createTempFixtures,
    readTempFile,
    sampleCSS,
    sampleHTML,
    sampleJS,
    sampleJSON,
    tempFileExists,
    type TempFixtures,
} from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Error Scenario Tests", () => {
    let fixtures: TempFixtures;

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
    });

    describe("Invalid syntax handling", () => {
        test("should throw error for invalid JavaScript syntax", async () => {
            fixtures = await createTempFixtures({
                "invalid.js": "function { broken syntax here",
            });

            await expect(
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "invalid.js"),
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow();
        });

        test("should throw error for invalid CSS syntax", async () => {
            fixtures = await createTempFixtures({
                "invalid.css": "body { color: ; broken }",
            });

            await expect(
                minify({
                    compressor: cleanCss,
                    input: path.join(fixtures.dir, "invalid.css"),
                    output: path.join(fixtures.dir, "output.css"),
                })
            ).rejects.toThrow();
        });

        test("should throw error for invalid JSON", async () => {
            fixtures = await createTempFixtures({
                "invalid.json": "{ invalid json: }",
            });

            await expect(
                minify({
                    compressor: jsonMinify,
                    input: path.join(fixtures.dir, "invalid.json"),
                    output: path.join(fixtures.dir, "output.json"),
                })
            ).rejects.toThrow();
        });
    });

    describe("File not found handling", () => {
        test("should throw error for non-existent input file", async () => {
            fixtures = await createTempFixtures({});

            await expect(
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "nonexistent.js"),
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow();
        });

        test("should throw error for non-existent input in array", async () => {
            fixtures = await createTempFixtures({
                "exists.js": "var a = 1;",
            });

            await expect(
                minify({
                    compressor: terser,
                    input: [
                        path.join(fixtures.dir, "exists.js"),
                        path.join(fixtures.dir, "nonexistent.js"),
                    ],
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow();
        });

        test("should throw error when wildcards match no files", async () => {
            fixtures = await createTempFixtures({});

            await expect(
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "**/*.js"),
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow();
        });
    });

    describe("Empty input handling", () => {
        test("should throw error for empty file", async () => {
            fixtures = await createTempFixtures({
                "empty.js": "",
            });

            await expect(
                minify({
                    compressor: noCompress,
                    input: path.join(fixtures.dir, "empty.js"),
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow(/content/i);
        });

        test("should throw error for whitespace-only file", async () => {
            fixtures = await createTempFixtures({
                "whitespace.js": "   \n\t\n   ",
            });

            await expect(
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "whitespace.js"),
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow(/content/i);
        });
    });

    describe("Invalid options handling", () => {
        test("should throw error when compressor is missing", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            await expect(
                minify({
                    input: path.join(fixtures.dir, "input.js"),
                    output: path.join(fixtures.dir, "output.js"),
                } as any)
            ).rejects.toThrow(/compressor/i);
        });

        test("should throw error when input is missing", async () => {
            fixtures = await createTempFixtures({});

            await expect(
                minify({
                    compressor: terser,
                    output: path.join(fixtures.dir, "output.js"),
                } as any)
            ).rejects.toThrow(/input/i);
        });

        test("should throw error when output is missing for file input", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            await expect(
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, "input.js"),
                } as any)
            ).rejects.toThrow(/output/i);
        });

        test("should throw error when output array length differs from input", async () => {
            fixtures = await createTempFixtures({
                "a.js": "var a = 1;",
                "b.js": "var b = 2;",
            });

            await expect(
                minify({
                    compressor: terser,
                    input: [
                        path.join(fixtures.dir, "a.js"),
                        path.join(fixtures.dir, "b.js"),
                    ],
                    output: [path.join(fixtures.dir, "a.min.js")],
                })
            ).rejects.toThrow(/length/i);
        });
    });

    describe("Invalid compressor handling", () => {
        test("should throw error when compressor is not a function", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            await expect(
                minify({
                    compressor: "not-a-function" as any,
                    input: path.join(fixtures.dir, "input.js"),
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow(/compressor/i);
        });

        test("should throw error when compressor is null", async () => {
            fixtures = await createTempFixtures({
                "input.js": sampleJS,
            });

            await expect(
                minify({
                    compressor: null as any,
                    input: path.join(fixtures.dir, "input.js"),
                    output: path.join(fixtures.dir, "output.js"),
                })
            ).rejects.toThrow(/compressor/i);
        });
    });

    describe("Large file handling", () => {
        test("should handle moderately large JS file", async () => {
            const largeJS = Array(1000)
                .fill('function test() { console.log("hello"); }')
                .join("\n");

            fixtures = await createTempFixtures({
                "large.js": largeJS,
            });

            const result = await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "large.js"),
                output: path.join(fixtures.dir, "large.min.js"),
            });

            expect(result).toBeDefined();
            expect(await tempFileExists(fixtures, "large.min.js")).toBe(true);

            const minified = await readTempFile(fixtures, "large.min.js");
            expect(minified.length).toBeLessThan(largeJS.length);
        });
    });

    describe("Special characters in paths", () => {
        test("should handle spaces in file paths", async () => {
            fixtures = await createTempFixtures({
                "file with spaces.js": sampleJS,
            });

            const result = await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "file with spaces.js"),
                output: path.join(fixtures.dir, "output with spaces.min.js"),
            });

            expect(result).toBeDefined();
            expect(
                await tempFileExists(fixtures, "output with spaces.min.js")
            ).toBe(true);
        });
    });

    describe("Concurrent operations", () => {
        test("should handle many concurrent minifications", async () => {
            const fileCount = 10;
            const files: Record<string, string> = {};
            for (let i = 0; i < fileCount; i++) {
                files[`file${i}.js`] = `function file${i}() { return ${i}; }`;
            }

            fixtures = await createTempFixtures(files);

            const promises = Array.from({ length: fileCount }, (_, i) =>
                minify({
                    compressor: terser,
                    input: path.join(fixtures.dir, `file${i}.js`),
                    output: path.join(fixtures.dir, `file${i}.min.js`),
                })
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(fileCount);
            for (let i = 0; i < fileCount; i++) {
                expect(await tempFileExists(fixtures, `file${i}.min.js`)).toBe(
                    true
                );
            }
        });
    });
});

describe("Examples Validation Tests", () => {
    describe("README examples", () => {
        test("should work with basic terser usage", async () => {
            const result = await minify({
                compressor: terser,
                content: 'var x = 1; console.log("hello");',
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        test("should work with in-memory HTML minification", async () => {
            const html = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>`;

            const result = await minify({
                compressor: htmlMinifier,
                content: html,
            });

            expect(result).toBeDefined();
            expect(result.length).toBeLessThan(html.length);
        });

        test("should work with in-memory JSON minification", async () => {
            const json = `{
    "name": "test",
    "version": "1.0.0"
}`;

            const result = await minify({
                compressor: jsonMinify,
                content: json,
            });

            expect(result).toBeDefined();
            expect(result).not.toContain("\n");
            expect(JSON.parse(result as string)).toEqual(JSON.parse(json));
        });
    });

    describe("Compressor availability", () => {
        test("terser should be available", async () => {
            const result = await minify({
                compressor: terser,
                content: "var a = 1;",
            });
            expect(result).toBeDefined();
        });

        test("clean-css should be available", async () => {
            const result = await minify({
                compressor: cleanCss,
                content: "body { margin: 0; }",
            });
            expect(result).toBeDefined();
        });

        test("html-minifier should be available", async () => {
            const result = await minify({
                compressor: htmlMinifier,
                content: "<html><body></body></html>",
            });
            expect(result).toBeDefined();
        });

        test("jsonminify should be available", async () => {
            const result = await minify({
                compressor: jsonMinify,
                content: '{"a": 1}',
            });
            expect(result).toBeDefined();
        });

        test("no-compress should be available", async () => {
            const result = await minify({
                compressor: noCompress,
                content: "unchanged content",
            });
            expect(result).toBeDefined();
        });
    });
});
