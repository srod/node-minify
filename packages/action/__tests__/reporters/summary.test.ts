/*! node-minify summary reporter tests - MIT Licensed */

import { summary } from "@actions/core";
import { describe, expect, test, vi } from "vitest";
import {
    generateAutoModeSummary,
    generateBenchmarkSummary,
    generateSummary,
} from "../../src/reporters/summary.ts";
import type {
    ActionInputs,
    BenchmarkResult,
    MinifyResult,
} from "../../src/types.ts";

/**
 * Flatten the `data` values of the most recent summary.addTable() call.
 */
function lastTableCells(): string[] {
    const calls = vi.mocked(summary.addTable).mock.calls;
    const table = calls[calls.length - 1]?.[0] as { data: unknown }[][];
    return table.flat().map((cell) => String(cell.data));
}

// Mock @actions/core
vi.mock("@actions/core", () => ({
    summary: {
        addHeading: vi.fn().mockReturnThis(),
        addTable: vi.fn().mockReturnThis(),
        addBreak: vi.fn().mockReturnThis(),
        addRaw: vi.fn().mockReturnThis(),
        write: vi.fn().mockResolvedValue({}),
    },
}));

describe("generateAutoModeSummary", () => {
    const inputs: ActionInputs = {
        auto: true,
        outputDir: "dist",
        compressor: "auto",
        options: {},
        reportSummary: true,
        reportPRComment: false,
        reportAnnotations: false,
        benchmark: false,
        benchmarkCompressors: [],
        failOnIncrease: false,
        minReduction: 0,
        includeGzip: true,
        workingDirectory: ".",
        dryRun: false,
    };

    test("groups results by file type", async () => {
        const results: MinifyResult[] = [
            {
                files: [
                    {
                        file: "a.js",
                        originalSize: 100,
                        minifiedSize: 50,
                        reduction: 50,
                        timeMs: 10,
                    },
                ],
                compressor: "terser",
                totalOriginalSize: 100,
                totalMinifiedSize: 50,
                totalReduction: 50,
                totalTimeMs: 10,
            },
            {
                files: [
                    {
                        file: "b.css",
                        originalSize: 200,
                        minifiedSize: 100,
                        reduction: 50,
                        timeMs: 20,
                    },
                ],
                compressor: "lightningcss",
                totalOriginalSize: 200,
                totalMinifiedSize: 100,
                totalReduction: 50,
                totalTimeMs: 20,
            },
        ];

        await generateAutoModeSummary(results, inputs);

        expect(summary.addHeading).toHaveBeenCalledWith("📜 JavaScript", 3);
        expect(summary.addHeading).toHaveBeenCalledWith("🎨 CSS", 3);
        expect(summary.addTable).toHaveBeenCalledTimes(2);
        expect(summary.write).toHaveBeenCalled();
    });

    test("calculates totals correctly across all types", async () => {
        const results: MinifyResult[] = [
            {
                files: [
                    {
                        file: "a.js",
                        originalSize: 100,
                        minifiedSize: 50,
                        reduction: 50,
                        timeMs: 10,
                    },
                ],
                compressor: "terser",
                totalOriginalSize: 100,
                totalMinifiedSize: 50,
                totalReduction: 50,
                totalTimeMs: 10,
            },
            {
                files: [
                    {
                        file: "b.css",
                        originalSize: 200,
                        minifiedSize: 100,
                        reduction: 50,
                        timeMs: 20,
                    },
                ],
                compressor: "lightningcss",
                totalOriginalSize: 200,
                totalMinifiedSize: 100,
                totalReduction: 50,
                totalTimeMs: 20,
            },
        ];

        await generateAutoModeSummary(results, inputs);

        expect(summary.addRaw).toHaveBeenCalledWith(
            expect.stringContaining(
                "**Total:** 300 B → 150 B (50.0% reduction)"
            )
        );
    });

    test("handles empty results gracefully", async () => {
        const results: MinifyResult[] = [];
        await generateAutoModeSummary(results, inputs);
        expect(summary.addRaw).toHaveBeenCalledWith("No files were processed.");
    });
});

describe("generateSummary", () => {
    test("writes a per-file table, compressor, and totals", async () => {
        const result: MinifyResult = {
            files: [
                {
                    file: "a.js",
                    originalSize: 1000,
                    minifiedSize: 400,
                    reduction: 60,
                    gzipSize: 150,
                    timeMs: 10,
                },
                {
                    // No gzipSize -> the "-" placeholder branch.
                    file: "b.css",
                    originalSize: 500,
                    minifiedSize: 450,
                    reduction: 10,
                    timeMs: 5,
                },
            ],
            compressor: "terser",
            totalOriginalSize: 1500,
            totalMinifiedSize: 850,
            totalReduction: 43.3,
            totalTimeMs: 15,
        };

        await generateSummary(result);

        expect(summary.addHeading).toHaveBeenCalledWith(
            "📦 node-minify Results",
            2
        );
        const cells = lastTableCells();
        // a.js has a gzip size; b.css does not -> "-" placeholder.
        expect(cells).toContain("150 B");
        expect(cells).toContain("-");
        expect(summary.addRaw).toHaveBeenCalledWith(
            expect.stringContaining("**Compressor:** terser")
        );
        expect(summary.addRaw).toHaveBeenCalledWith(
            expect.stringContaining("**Total:**")
        );
        expect(summary.write).toHaveBeenCalled();
    });
});

describe("generateBenchmarkSummary", () => {
    test("renders badges, failures, and missing metrics", async () => {
        const result: BenchmarkResult = {
            file: "app.js",
            originalSize: 1000,
            compressors: [
                {
                    compressor: "terser",
                    success: true,
                    size: 400,
                    reduction: 60,
                    gzipSize: 150,
                    timeMs: 10,
                },
                {
                    compressor: "esbuild",
                    success: true,
                    size: 420,
                    reduction: 58,
                    gzipSize: 160,
                    timeMs: 5,
                },
                {
                    compressor: "gcc",
                    success: true,
                    size: 380,
                    reduction: 62,
                    gzipSize: 140,
                    timeMs: 50,
                },
                // Succeeded but every metric is missing -> "-" placeholders, no badge.
                { compressor: "plain", success: true },
                // Failed with and without an error message.
                { compressor: "broken", success: false, error: "nope" },
                { compressor: "broken2", success: false },
            ],
            recommended: "terser",
            bestSpeed: "esbuild",
            bestCompression: "gcc",
        };

        await generateBenchmarkSummary(result);

        expect(summary.addHeading).toHaveBeenCalledWith(
            "🏁 Benchmark Results",
            2
        );
        const cells = lastTableCells();
        // Badges: recommended 🏆, best speed ⚡, best compression 📦.
        expect(cells).toContain("terser 🏆");
        expect(cells).toContain("esbuild ⚡");
        expect(cells).toContain("gcc 📦");
        // Failed rows, with and without an explicit error message.
        expect(cells).toContain("❌ Failed");
        expect(cells).toContain("nope");
        expect(cells).toContain("Unknown error");
        // Succeeded-but-missing-metrics row renders "-" placeholders.
        expect(cells).toContain("-");
        expect(summary.addRaw).toHaveBeenCalledWith(
            expect.stringContaining("**Recommended:** terser")
        );
        expect(summary.write).toHaveBeenCalled();
    });

    test("falls back to N/A when no compressor is recommended", async () => {
        const result: BenchmarkResult = {
            file: "app.js",
            originalSize: 100,
            compressors: [
                {
                    compressor: "terser",
                    success: true,
                    size: 50,
                    reduction: 50,
                    gzipSize: 20,
                    timeMs: 1,
                },
            ],
        };

        await generateBenchmarkSummary(result);

        expect(summary.addRaw).toHaveBeenCalledWith(
            expect.stringContaining("**Recommended:** N/A")
        );
    });
});
