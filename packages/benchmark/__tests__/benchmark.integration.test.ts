/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { benchmark } from "../src/index.ts";
import type { BenchmarkResult, CompressorMetrics } from "../src/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fixtureJS = path.resolve(
    __dirname,
    "../../../tests/fixtures/es5/fixture-1.js"
);
const fixtureJS2 = path.resolve(
    __dirname,
    "../../../tests/fixtures/es5/fixture-2.js"
);
const fixtureCSS = path.resolve(
    __dirname,
    "../../../tests/fixtures/css/fixture-1.css"
);
const fixtureCSS2 = path.resolve(
    __dirname,
    "../../../tests/fixtures/css/fixture-2.css"
);
const fixtureHTML = path.resolve(
    __dirname,
    "../../../tests/fixtures/html/fixture-1.html"
);
const fixtureJSON = path.resolve(
    __dirname,
    "../../../tests/fixtures/json/fixture-1.json"
);

function assertValidBenchmarkResult(result: BenchmarkResult): void {
    expect(result).toBeDefined();
    expect(result.timestamp).toBeDefined();
    expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    expect(result.files).toBeDefined();
    expect(Array.isArray(result.files)).toBe(true);
    expect(result.summary).toBeDefined();
    expect(result.summary.bestCompression).toBeDefined();
    expect(result.summary.bestPerformance).toBeDefined();
    expect(result.summary.recommended).toBeDefined();
}

function assertSuccessfulCompressor(
    metrics: CompressorMetrics | undefined,
    compressorName: string
): asserts metrics is CompressorMetrics {
    expect(metrics).toBeDefined();
    if (!metrics) throw new Error("metrics is undefined");
    expect(metrics.compressor).toBe(compressorName);
    expect(metrics.success).toBe(true);
    expect(metrics.sizeBytes).toBeGreaterThan(0);
    expect(metrics.size).toBeDefined();
    expect(metrics.timeMs).toBeGreaterThanOrEqual(0);
    expect(metrics.reductionPercent).toBeGreaterThanOrEqual(0);
    expect(metrics.error).toBeUndefined();
}

describe("Benchmark Integration Tests", () => {
    describe("JavaScript Compressors", () => {
        test("should benchmark terser with real file", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);
            expect(result.files).toHaveLength(1);

            const fileResult = result.files[0];
            expect(fileResult).toBeDefined();
            expect(fileResult?.file).toBe(fixtureJS);
            expect(fileResult?.originalSizeBytes).toBeGreaterThan(0);
            expect(fileResult?.results).toHaveLength(1);

            const terserResult = fileResult?.results[0];
            expect(terserResult).toBeDefined();
            assertSuccessfulCompressor(terserResult, "terser");
        });

        test("should benchmark esbuild with real file", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["esbuild"],
                iterations: 1,
                type: "js",
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const esbuildResult = fileResult?.results[0];
            expect(esbuildResult).toBeDefined();
            assertSuccessfulCompressor(esbuildResult, "esbuild");
        });

        test("should benchmark swc with real file", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["swc"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const swcResult = fileResult?.results[0];
            expect(swcResult).toBeDefined();
            assertSuccessfulCompressor(swcResult, "swc");
        });

        test("should compare multiple JS compressors", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser", "esbuild", "swc"],
                iterations: 1,
                type: "js",
            });

            assertValidBenchmarkResult(result);
            expect(result.files).toHaveLength(1);

            const fileResult = result.files[0];
            expect(fileResult?.results).toHaveLength(3);

            for (const compressorResult of fileResult?.results ?? []) {
                expect(compressorResult.success).toBe(true);
                expect(compressorResult.sizeBytes).toBeGreaterThan(0);
            }

            expect(["terser", "esbuild", "swc"]).toContain(
                result.summary.bestCompression
            );
            expect(["terser", "esbuild", "swc"]).toContain(
                result.summary.bestPerformance
            );
            expect(["terser", "esbuild", "swc"]).toContain(
                result.summary.recommended
            );
        });

        test("should handle multiple iterations for JS", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser"],
                iterations: 3,
                warmup: 1,
            });

            assertValidBenchmarkResult(result);
            const terserResult = result.files[0]?.results[0];
            expect(terserResult).toBeDefined();
            expect(terserResult?.success).toBe(true);

            expect(terserResult?.timeMinMs).toBeDefined();
            expect(terserResult?.timeMaxMs).toBeDefined();
            expect(terserResult?.timeMinMs).toBeLessThanOrEqual(
                terserResult?.timeMs ?? 0
            );
            expect(terserResult?.timeMaxMs).toBeGreaterThanOrEqual(
                terserResult?.timeMs ?? 0
            );
        });

        test("should include iteration times when verbose is true", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser"],
                iterations: 2,
                verbose: true,
            });

            assertValidBenchmarkResult(result);
            const terserResult = result.files[0]?.results[0];
            expect(terserResult?.iterationTimes).toBeDefined();
            expect(terserResult?.iterationTimes).toHaveLength(2);
        });
    });

    describe("CSS Compressors", () => {
        test("should benchmark clean-css with real file", async () => {
            const result = await benchmark({
                input: fixtureCSS,
                compressors: ["clean-css"],
                iterations: 1,
                type: "css",
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const cleanCssResult = fileResult?.results[0];
            expect(cleanCssResult).toBeDefined();
            assertSuccessfulCompressor(cleanCssResult, "clean-css");
        });

        test("should benchmark cssnano with real file", async () => {
            const result = await benchmark({
                input: fixtureCSS,
                compressors: ["cssnano"],
                iterations: 1,
                type: "css",
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const cssnanoResult = fileResult?.results[0];
            expect(cssnanoResult).toBeDefined();
            assertSuccessfulCompressor(cssnanoResult, "cssnano");
        });

        test("should benchmark csso with real file", async () => {
            const result = await benchmark({
                input: fixtureCSS,
                compressors: ["csso"],
                iterations: 1,
                type: "css",
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const cssoResult = fileResult?.results[0];
            expect(cssoResult).toBeDefined();
            assertSuccessfulCompressor(cssoResult, "csso");
        });

        test("should benchmark lightningcss with real file", async () => {
            const result = await benchmark({
                input: fixtureCSS,
                compressors: ["lightningcss"],
                iterations: 1,
                type: "css",
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const lightningcssResult = fileResult?.results[0];
            expect(lightningcssResult).toBeDefined();
            assertSuccessfulCompressor(lightningcssResult, "lightningcss");
        });

        test("should compare multiple CSS compressors", async () => {
            const result = await benchmark({
                input: fixtureCSS,
                compressors: ["clean-css", "cssnano", "csso", "lightningcss"],
                iterations: 1,
                type: "css",
            });

            assertValidBenchmarkResult(result);
            expect(result.files).toHaveLength(1);

            const fileResult = result.files[0];
            expect(fileResult?.results).toHaveLength(4);

            for (const compressorResult of fileResult?.results ?? []) {
                expect(compressorResult.success).toBe(true);
                expect(compressorResult.sizeBytes).toBeGreaterThan(0);
            }
        });
    });

    describe("HTML Compressor", () => {
        test("should benchmark html-minifier with real file", async () => {
            const result = await benchmark({
                input: fixtureHTML,
                compressors: ["html-minifier"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const htmlMinifierResult = fileResult?.results[0];
            expect(htmlMinifierResult).toBeDefined();
            assertSuccessfulCompressor(htmlMinifierResult, "html-minifier");
        });
    });

    describe("JSON Compressor", () => {
        test("should benchmark jsonminify with real file", async () => {
            const result = await benchmark({
                input: fixtureJSON,
                compressors: ["jsonminify"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);
            const fileResult = result.files[0];
            const jsonResult = fileResult?.results[0];
            expect(jsonResult).toBeDefined();
            assertSuccessfulCompressor(jsonResult, "jsonminify");
        });
    });

    describe("Gzip Size Calculation", () => {
        test("should include gzip size when requested for JS", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser"],
                iterations: 1,
                includeGzip: true,
            });

            assertValidBenchmarkResult(result);
            const terserResult = result.files[0]?.results[0];
            expect(terserResult).toBeDefined();
            expect(terserResult?.success).toBe(true);
            expect(terserResult?.gzipSize).toBeDefined();
        });

        test("should include gzip size when requested for CSS", async () => {
            const result = await benchmark({
                input: fixtureCSS,
                compressors: ["clean-css"],
                iterations: 1,
                includeGzip: true,
                type: "css",
            });

            assertValidBenchmarkResult(result);
            const cleanCssResult = result.files[0]?.results[0];
            expect(cleanCssResult).toBeDefined();
            expect(cleanCssResult?.success).toBe(true);
            expect(cleanCssResult?.gzipSize).toBeDefined();
        });

        test("should include brotli size when requested for JS", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser"],
                iterations: 1,
                includeBrotli: true,
            });

            assertValidBenchmarkResult(result);
            const terserResult = result.files[0]?.results[0];
            expect(terserResult).toBeDefined();
            expect(terserResult?.success).toBe(true);
            expect(terserResult?.brotliSize).toBeDefined();
        });
    });

    describe("Multiple Files", () => {
        test("should benchmark multiple JS files", async () => {
            const result = await benchmark({
                input: [fixtureJS, fixtureJS2],
                compressors: ["terser"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);
            expect(result.files).toHaveLength(2);

            for (const fileResult of result.files) {
                expect(fileResult.originalSizeBytes).toBeGreaterThan(0);
                expect(fileResult.results).toHaveLength(1);
                expect(fileResult.results[0]?.success).toBe(true);
            }
        });

        test("should benchmark multiple CSS files", async () => {
            const result = await benchmark({
                input: [fixtureCSS, fixtureCSS2],
                compressors: ["clean-css"],
                iterations: 1,
                type: "css",
            });

            assertValidBenchmarkResult(result);
            expect(result.files).toHaveLength(2);

            for (const fileResult of result.files) {
                expect(fileResult.originalSizeBytes).toBeGreaterThan(0);
                expect(fileResult.results).toHaveLength(1);
                expect(fileResult.results[0]?.success).toBe(true);
            }
        });
    });

    describe("Warmup Iterations", () => {
        test("should perform warmup iterations before measurement", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser"],
                iterations: 2,
                warmup: 2,
            });

            assertValidBenchmarkResult(result);
            const terserResult = result.files[0]?.results[0];
            expect(terserResult).toBeDefined();
            expect(terserResult?.success).toBe(true);
            expect(terserResult?.sizeBytes).toBeGreaterThan(0);
        });
    });

    describe("Summary Calculations", () => {
        test("should correctly identify best compression", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser", "esbuild"],
                iterations: 1,
                type: "js",
            });

            assertValidBenchmarkResult(result);

            const results = result.files[0]?.results ?? [];
            const successfulResults = results.filter((r) => r.success);

            const bestCompression = successfulResults.reduce((prev, curr) =>
                curr.reductionPercent > prev.reductionPercent ? curr : prev
            );

            expect(result.summary.bestCompression).toBe(
                bestCompression.compressor
            );
        });

        test("should correctly identify fastest compressor", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser", "esbuild"],
                iterations: 1,
                type: "js",
            });

            assertValidBenchmarkResult(result);

            const results = result.files[0]?.results ?? [];
            const successfulResults = results.filter((r) => r.success);

            const fastest = successfulResults.reduce((prev, curr) =>
                curr.timeMs < prev.timeMs ? curr : prev
            );

            expect(result.summary.bestPerformance).toBe(fastest.compressor);
        });
    });

    describe("Error Handling", () => {
        test("should handle non-existent compressor gracefully", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["non-existent-compressor"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);
            const failedResult = result.files[0]?.results[0];
            expect(failedResult).toBeDefined();
            expect(failedResult?.success).toBe(false);
            expect(failedResult?.error).toBeDefined();
            expect(failedResult?.error).toContain("not found");
        });

        test("should handle mixed successful and failed compressors", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["terser", "non-existent-compressor"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);
            const results = result.files[0]?.results ?? [];

            expect(results).toHaveLength(2);

            const terserResult = results.find((r) => r.compressor === "terser");
            const nonExistentResult = results.find(
                (r) => r.compressor === "non-existent-compressor"
            );

            expect(terserResult?.success).toBe(true);
            expect(nonExistentResult?.success).toBe(false);

            expect(result.summary.bestCompression).toBe("terser");
            expect(result.summary.bestPerformance).toBe("terser");
            expect(result.summary.recommended).toBe("terser");
        });

        test("should handle all compressors failing", async () => {
            const result = await benchmark({
                input: fixtureJS,
                compressors: ["non-existent-1", "non-existent-2"],
                iterations: 1,
            });

            assertValidBenchmarkResult(result);

            expect(result.summary.bestCompression).toBe("N/A");
            expect(result.summary.bestPerformance).toBe("N/A");
            expect(result.summary.recommended).toBe("N/A");
        });
    });

    describe("Default Behavior", () => {
        test("should use default compressors when not specified", async () => {
            const result = await benchmark({
                input: fixtureJS,
                iterations: 1,
                type: "js",
            });

            assertValidBenchmarkResult(result);

            const compressorNames =
                result.files[0]?.results.map((r) => r.compressor) ?? [];
            expect(compressorNames).toContain("terser");
            expect(compressorNames).toContain("esbuild");
            expect(compressorNames).toContain("swc");
        });
    });

    describe("Cross-Type Compressors", () => {
        test("should benchmark esbuild for both JS and CSS", async () => {
            const jsResult = await benchmark({
                input: fixtureJS,
                compressors: ["esbuild"],
                iterations: 1,
                type: "js",
            });

            const cssResult = await benchmark({
                input: fixtureCSS,
                compressors: ["esbuild"],
                iterations: 1,
                type: "css",
            });

            assertValidBenchmarkResult(jsResult);
            assertValidBenchmarkResult(cssResult);

            expect(jsResult.files[0]?.results[0]?.success).toBe(true);
            expect(cssResult.files[0]?.results[0]?.success).toBe(true);
        });
    });
});
