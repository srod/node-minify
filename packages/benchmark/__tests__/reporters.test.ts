/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import { formatConsoleOutput } from "../src/reporters/console.ts";
import { getReporter } from "../src/reporters/index.ts";
import { formatJsonOutput } from "../src/reporters/json.ts";
import { formatMarkdownOutput } from "../src/reporters/markdown.ts";
import type { BenchmarkResult } from "../src/types.ts";

function createMockResult(
    overrides: Partial<BenchmarkResult> = {}
): BenchmarkResult {
    return {
        timestamp: "2026-01-02T10:30:00Z",
        options: { compressors: ["terser", "esbuild"], iterations: 1 },
        files: [
            {
                file: "test.js",
                originalSizeBytes: 10000,
                originalSize: "10 KB",
                results: [
                    {
                        compressor: "terser",
                        sizeBytes: 3000,
                        size: "3 KB",
                        timeMs: 100,
                        reductionPercent: 70,
                        success: true,
                    },
                    {
                        compressor: "esbuild",
                        sizeBytes: 3500,
                        size: "3.5 KB",
                        timeMs: 50,
                        reductionPercent: 65,
                        success: true,
                    },
                ],
            },
        ],
        summary: {
            bestCompression: "terser",
            bestPerformance: "esbuild",
            recommended: "esbuild",
        },
        ...overrides,
    };
}

function createFailedResult(): BenchmarkResult {
    return {
        timestamp: "2026-01-02T10:30:00Z",
        options: { compressors: ["non-existent"] },
        files: [
            {
                file: "test.js",
                originalSizeBytes: 10000,
                originalSize: "10 KB",
                results: [
                    {
                        compressor: "non-existent",
                        sizeBytes: 0,
                        size: "0 B",
                        timeMs: 0,
                        reductionPercent: 0,
                        success: false,
                        error: "Compressor not found or not installed",
                    },
                ],
            },
        ],
        summary: {
            bestCompression: "N/A",
            bestPerformance: "N/A",
            recommended: "N/A",
        },
    };
}

describe("Reporters - JSON", () => {
    test("should format result as JSON", () => {
        const result = createMockResult();
        const output = formatJsonOutput(result);
        const parsed = JSON.parse(output);

        expect(parsed).toEqual(result);
    });

    test("should handle failed compressors in JSON", () => {
        const result = createFailedResult();
        const output = formatJsonOutput(result);
        const parsed = JSON.parse(output);

        expect(parsed.files[0].results[0].success).toBe(false);
        expect(parsed.files[0].results[0].error).toBeDefined();
    });

    test("should be valid JSON string", () => {
        const result = createMockResult();
        const output = formatJsonOutput(result);

        expect(() => JSON.parse(output)).not.toThrow();
    });
});

describe("Reporters - Console", () => {
    test("should format basic results for console", () => {
        const result = createMockResult();
        const output = formatConsoleOutput(result);

        expect(output).toContain("🔍 Benchmarking:");
        expect(output).toContain("test.js");
        expect(output).toContain("10 KB");
        expect(output).toContain("terser");
        expect(output).toContain("esbuild");
        expect(output).toContain("🏆 Best compression:");
        expect(output).toContain("terser");
        expect(output).toContain("⚡ Fastest:");
        expect(output).toContain("esbuild");
        expect(output).toContain("💡 Recommended:");
        expect(output).toContain("OK");
    });

    test("should include gzip column when gzip data exists", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            gzipBytes: 1500,
                            gzipSize: "1.5 KB",
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatConsoleOutput(result);

        expect(output).toContain("Gzip");
    });

    test("should include brotli column when brotli data exists", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            brotliBytes: 1200,
                            brotliSize: "1.2 KB",
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatConsoleOutput(result);

        expect(output).toContain("Brotli");
    });

    test("should show iteration times when verbose is true", () => {
        const result = createMockResult({
            options: { verbose: true },
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            timeMinMs: 90,
                            timeMaxMs: 110,
                            iterationTimes: [90, 100, 110],
                            reductionPercent: 70,
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatConsoleOutput(result);

        expect(output).toContain("└─");
        expect(output).toContain("90ms");
        expect(output).toContain("100ms");
        expect(output).toContain("110ms");
    });

    test("should handle failed compressors in console output", () => {
        const result = createFailedResult();
        const output = formatConsoleOutput(result);

        expect(output).toContain("non-existent");
        expect(output).toContain("Compressor not found or not installed");
    });

    test("should handle multiple files", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test1.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            success: true,
                        },
                    ],
                },
                {
                    file: "test2.js",
                    originalSizeBytes: 20000,
                    originalSize: "20 KB",
                    results: [
                        {
                            compressor: "esbuild",
                            sizeBytes: 6000,
                            size: "6 KB",
                            timeMs: 80,
                            reductionPercent: 70,
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatConsoleOutput(result);

        expect(output).toContain("test1.js");
        expect(output).toContain("test2.js");
        expect(output).toContain("10 KB");
        expect(output).toContain("20 KB");
    });

    test("should handle N/A in summary when all compressors fail", () => {
        const result = createFailedResult();
        const output = formatConsoleOutput(result);

        expect(output).toContain("N/A");
        expect(output).toContain("🏆 Best compression: N/A");
        expect(output).toContain("⚡ Fastest: N/A");
        expect(output).toContain("💡 Recommended: N/A");
    });
});

describe("Reporters - Markdown", () => {
    test("should format basic results as markdown", () => {
        const result = createMockResult();
        const output = formatMarkdownOutput(result);

        expect(output).toContain("# Benchmark Results");
        expect(output).toContain("**Generated:**");
        expect(output).toContain("## test.js (10 KB)");
        expect(output).toContain(
            "| Compressor | Size | Reduction | Time | Status |"
        );
        expect(output).toContain("| terser | 3 KB | 70.0% | 100ms | OK |");
        expect(output).toContain("| esbuild | 3.5 KB | 65.0% | 50ms | OK |");
        expect(output).toContain("### Summary");
        expect(output).toContain("- 🏆 **Best compression:** terser");
        expect(output).toContain("- ⚡ **Fastest:** esbuild");
        expect(output).toContain("- 💡 **Recommended:** esbuild");
    });

    test("should include gzip column when gzip data exists", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            gzipBytes: 1500,
                            gzipSize: "1.5 KB",
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatMarkdownOutput(result);

        expect(output).toContain(" Gzip |");
        expect(output).toContain(" 1.5 KB |");
    });

    test("should include brotli column when brotli data exists", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            brotliBytes: 1200,
                            brotliSize: "1.2 KB",
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatMarkdownOutput(result);

        expect(output).toContain(" Brotli |");
        expect(output).toContain(" 1.2 KB |");
    });

    test("should handle failed compressors in markdown", () => {
        const result = createFailedResult();
        const output = formatMarkdownOutput(result);

        expect(output).toContain(
            "| non-existent | - | - | - | ERROR: Compressor not found or not installed |"
        );
    });

    test("should show '-' for missing gzip/brotli columns", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            gzipBytes: 1500,
                            gzipSize: "1.5 KB",
                            success: true,
                        },
                        {
                            compressor: "esbuild",
                            sizeBytes: 3500,
                            size: "3.5 KB",
                            timeMs: 50,
                            reductionPercent: 65,
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatMarkdownOutput(result);

        expect(output).toContain("1.5 KB |");
        expect(output).toContain("- |");
    });

    test("should handle multiple files in markdown", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test1.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            success: true,
                        },
                    ],
                },
                {
                    file: "test2.js",
                    originalSizeBytes: 20000,
                    originalSize: "20 KB",
                    results: [
                        {
                            compressor: "esbuild",
                            sizeBytes: 6000,
                            size: "6 KB",
                            timeMs: 80,
                            reductionPercent: 70,
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatMarkdownOutput(result);

        expect(output).toContain("## test1.js (10 KB)");
        expect(output).toContain("## test2.js (20 KB)");
    });
});

describe("getReporter", () => {
    test("should return console reporter for default", () => {
        const reporter = getReporter();
        expect(reporter).toBe(formatConsoleOutput);
    });

    test("should return console reporter for 'console' format", () => {
        const reporter = getReporter("console");
        expect(reporter).toBe(formatConsoleOutput);
    });

    test("should return json reporter for 'json' format", () => {
        const reporter = getReporter("json");
        expect(reporter).toBe(formatJsonOutput);
    });

    test("should return markdown reporter for 'markdown' format", () => {
        const reporter = getReporter("markdown");
        expect(reporter).toBe(formatMarkdownOutput);
    });

    test("should return markdown reporter for 'md' format", () => {
        const reporter = getReporter("md");
        expect(reporter).toBe(formatMarkdownOutput);
    });

    test("should return console reporter for unknown format", () => {
        const reporter = getReporter("unknown");
        expect(reporter).toBe(formatConsoleOutput);
    });

    test("returned reporters should produce valid output", () => {
        const result = createMockResult();

        const consoleReporter = getReporter("console");
        const jsonReporter = getReporter("json");
        const markdownReporter = getReporter("markdown");

        expect(typeof consoleReporter(result)).toBe("string");
        expect(() => JSON.parse(jsonReporter(result))).not.toThrow();
        expect(typeof markdownReporter(result)).toBe("string");
    });

    test("should handle mixed gzip results (some with, some without)", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            gzipBytes: 1500,
                            gzipSize: "1.5 KB",
                            success: true,
                        },
                        {
                            compressor: "esbuild",
                            sizeBytes: 3500,
                            size: "3.5 KB",
                            timeMs: 50,
                            reductionPercent: 65,
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatConsoleOutput(result);

        expect(output).toContain("terser");
        expect(output).toContain("esbuild");
        expect(output).toContain("Gzip");
        expect(output).toContain("1.5 KB");
        expect(output).toContain("-         OK");
    });

    test("should handle mixed gzip results in markdown (some with, some without)", () => {
        const result = createMockResult({
            files: [
                {
                    file: "test.js",
                    originalSizeBytes: 10000,
                    originalSize: "10 KB",
                    results: [
                        {
                            compressor: "terser",
                            sizeBytes: 3000,
                            size: "3 KB",
                            timeMs: 100,
                            reductionPercent: 70,
                            gzipBytes: 1500,
                            gzipSize: "1.5 KB",
                            success: true,
                        },
                        {
                            compressor: "esbuild",
                            sizeBytes: 3500,
                            size: "3.5 KB",
                            timeMs: 50,
                            reductionPercent: 65,
                            success: true,
                        },
                    ],
                },
            ],
        });
        const output = formatMarkdownOutput(result);

        expect(output).toContain("terser");
        expect(output).toContain("esbuild");
        expect(output).toContain("Gzip");
        expect(output).toContain("1.5 KB");
        expect(output).toMatch(/\| - \|/);
    });
});
