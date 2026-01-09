/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test, vi } from "vitest";
import { benchmark } from "../src/index.ts";
import type { BenchmarkOptions } from "../src/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureJS = path.resolve(
    __dirname,
    "../../../tests/fixtures/es5/fixture-1.js"
);

describe("Runner Edge Cases", () => {
    test("should call onProgress callback for each compressor", async () => {
        const onProgress = vi.fn();
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser", "esbuild"],
            iterations: 1,
            onProgress,
        });

        expect(onProgress).toHaveBeenCalledTimes(2);
        expect(onProgress).toHaveBeenCalledWith("terser", fixtureJS);
        expect(onProgress).toHaveBeenCalledWith("esbuild", fixtureJS);
        expect(results.files).toHaveLength(1);
        expect(results.files[0]?.results[0]?.success).toBe(true);
    });

    test("should handle onProgress with multiple files", async () => {
        const onProgress = vi.fn();
        const fixture2 = path.resolve(
            __dirname,
            "../../../tests/fixtures/es5/fixture-2.js"
        );

        const results = await benchmark({
            input: [fixtureJS, fixture2],
            compressors: ["terser"],
            iterations: 1,
            onProgress,
        });

        expect(onProgress).toHaveBeenCalledTimes(2);
        expect(onProgress).toHaveBeenCalledWith("terser", fixtureJS);
        expect(onProgress).toHaveBeenCalledWith("terser", fixture2);
        expect(results.files).toHaveLength(2);
    });

    test("should include compressorOptions in minify call", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 1,
            compressorOptions: {
                ecma: 2015,
                toplevel: true,
            },
        });

        expect(results.files).toHaveLength(1);
        expect(results.files[0]?.results[0]?.success).toBe(true);
    });

    test("should handle wildcard patterns in input", async () => {
        const results = await benchmark({
            input: path.resolve(__dirname, "../../../tests/fixtures/es5/*.js"),
            compressors: ["terser"],
            iterations: 1,
        });

        expect(results.files.length).toBeGreaterThan(0);
        for (const fileResult of results.files) {
            expect(fileResult.results[0]?.success).toBe(true);
        }
    });

    test("should deduplicate files from wildcards", async () => {
        const pattern = path.resolve(
            __dirname,
            "../../../tests/fixtures/es5/*.js"
        );

        const results1 = await benchmark({
            input: pattern,
            compressors: ["terser"],
            iterations: 1,
        });

        const results2 = await benchmark({
            input: [pattern, pattern],
            compressors: ["terser"],
            iterations: 1,
        });

        expect(results1.files.length).toBe(results2.files.length);
        expect(results1.files.length).toBeGreaterThan(0);
    });

    test("should handle single file input (array)", async () => {
        const results = await benchmark({
            input: [fixtureJS],
            compressors: ["terser"],
            iterations: 1,
        });

        expect(results.files).toHaveLength(1);
        expect(results.files[0]?.file).toBe(fixtureJS);
    });

    test("should handle single file input (string)", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 1,
        });

        expect(results.files).toHaveLength(1);
        expect(results.files[0]?.file).toBe(fixtureJS);
    });

    test("should handle type option correctly for CSS files", async () => {
        const fixtureCSS = path.resolve(
            __dirname,
            "../../../tests/fixtures/css/fixture-1.css"
        );

        const results = await benchmark({
            input: fixtureCSS,
            compressors: ["clean-css"],
            iterations: 1,
            type: "css",
        });

        expect(results.files).toHaveLength(1);
        expect(results.files[0]?.results[0]?.success).toBe(true);
    });

    test("should include options in result", async () => {
        const options: BenchmarkOptions = {
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 1,
            includeGzip: true,
            warmup: 1,
        };

        const results = await benchmark(options);

        expect(results.options).toBeDefined();
        expect(results.options.compressors).toEqual(["terser"]);
        expect(results.options.iterations).toBe(1);
        expect(results.options.includeGzip).toBe(true);
        expect(results.options.warmup).toBe(1);
    });

    test("should handle both gzip and brotli options", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 1,
            includeGzip: true,
            includeBrotli: true,
        });

        const result = results.files[0]?.results[0];
        expect(result?.success).toBe(true);
        expect(result?.gzipSize).toBeDefined();
        expect(result?.brotliSize).toBeDefined();
    });

    test("should handle verbose option", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 3,
            verbose: true,
        });

        const result = results.files[0]?.results[0];
        expect(result?.success).toBe(true);
        expect(result?.iterationTimes).toBeDefined();
        expect(result?.iterationTimes).toHaveLength(3);
    });

    test("should respect warmup iterations", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 2,
            warmup: 2,
        });

        const result = results.files[0]?.results[0];
        expect(result?.success).toBe(true);
        expect(result?.timeMinMs).toBeDefined();
        expect(result?.timeMaxMs).toBeDefined();
    });

    test("should handle warmup when iterations is 1", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 1,
            warmup: 0,
        });

        const result = results.files[0]?.results[0];
        expect(result?.success).toBe(true);
    });

    test("should use default warmup when not specified", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 3,
        });

        const result = results.files[0]?.results[0];
        expect(result?.success).toBe(true);
    });

    test("should handle both gzip and verbose together", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 2,
            includeGzip: true,
            verbose: true,
        });

        const result = results.files[0]?.results[0];
        expect(result?.success).toBe(true);
        expect(result?.gzipSize).toBeDefined();
        expect(result?.iterationTimes).toBeDefined();
    });

    test("should return valid ISO timestamp", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 1,
        });

        expect(results.timestamp).toBeDefined();
        expect(() => new Date(results.timestamp).toISOString()).not.toThrow();
    });

    test("should handle wildcard with non-matching pattern", async () => {
        const results = await benchmark({
            input: path.resolve(
                __dirname,
                "../../../tests/fixtures/nonexistent/*.js"
            ),
            compressors: ["terser"],
            iterations: 1,
        });

        expect(results.files).toBeDefined();
        expect(results.files).toHaveLength(0);
    });

    test("should use default warmup of 0 when iterations is 1 and warmup not specified", async () => {
        const results = await benchmark({
            input: fixtureJS,
            compressors: ["terser"],
            iterations: 1,
        });

        const result = results.files[0]?.results[0];
        expect(result?.success).toBe(true);
    });
});
