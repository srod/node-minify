/*! node-minify action tests - MIT Licensed */

import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock @node-minify/benchmark
vi.mock("@node-minify/benchmark", () => ({
    benchmark: vi.fn(),
}));

import { benchmark } from "@node-minify/benchmark";
import { runBenchmark } from "../src/benchmark.ts";
import type { ActionInputs } from "../src/types.ts";

describe("runBenchmark", () => {
    const baseInputs: ActionInputs = {
        input: "src/app.js",
        output: "dist/app.min.js",
        compressor: "terser",
        options: {},
        reportSummary: false,
        reportPRComment: false,
        reportAnnotations: false,
        benchmark: true,
        benchmarkCompressors: ["terser", "esbuild", "swc", "oxc"],
        failOnIncrease: false,
        minReduction: 0,
        includeGzip: true,
        workingDirectory: ".",
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("filters out type-required compressors when type not provided", async () => {
        vi.mocked(benchmark).mockResolvedValue({
            timestamp: new Date().toISOString(),
            options: {},
            files: [
                {
                    file: "src/app.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [],
                },
            ],
            summary: {
                bestCompression: "N/A",
                bestPerformance: "N/A",
                recommended: "N/A",
            },
        });

        await runBenchmark({ ...baseInputs, type: undefined });

        expect(benchmark).toHaveBeenCalledWith(
            expect.objectContaining({
                // esbuild should be filtered out (requires type)
                compressors: ["terser", "swc", "oxc"],
            })
        );
    });

    test("includes all compressors when type is provided", async () => {
        vi.mocked(benchmark).mockResolvedValue({
            timestamp: new Date().toISOString(),
            options: {},
            files: [
                {
                    file: "src/app.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [],
                },
            ],
            summary: {
                bestCompression: "N/A",
                bestPerformance: "N/A",
                recommended: "N/A",
            },
        });

        await runBenchmark({ ...baseInputs, type: "js" });

        expect(benchmark).toHaveBeenCalledWith(
            expect.objectContaining({
                compressors: ["terser", "esbuild", "swc", "oxc"],
            })
        );
    });

    test("maps benchmark results correctly", async () => {
        vi.mocked(benchmark).mockResolvedValue({
            timestamp: new Date().toISOString(),
            options: {},
            files: [
                {
                    file: "src/app.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            success: true,
                            sizeBytes: 3000,
                            size: "3 KB",
                            reductionPercent: 70,
                            gzipBytes: 1200,
                            gzipSize: "1.2 KB",
                            timeMs: 150,
                        },
                    ],
                },
            ],
            summary: {
                bestCompression: "terser",
                bestPerformance: "terser",
                recommended: "terser",
            },
        });

        const result = await runBenchmark({ ...baseInputs, type: "js" });

        expect(result.originalSize).toBe(10000);
        expect(result.compressors[0]).toEqual({
            compressor: "terser",
            success: true,
            size: 3000,
            reduction: 70,
            gzipSize: 1200,
            timeMs: 150,
            error: undefined,
        });
        expect(result.recommended).toBe("terser");
        expect(result.bestCompression).toBe("terser");
        expect(result.bestSpeed).toBe("terser");
    });

    test("throws error when no file results", async () => {
        vi.mocked(benchmark).mockResolvedValue({
            timestamp: new Date().toISOString(),
            options: {},
            files: [],
            summary: {
                bestCompression: "N/A",
                bestPerformance: "N/A",
                recommended: "N/A",
            },
        });

        await expect(runBenchmark(baseInputs)).rejects.toThrow(
            'Benchmark failed: no results for input "src/app.js"'
        );
    });
});
