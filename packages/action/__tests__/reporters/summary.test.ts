/*! node-minify summary reporter tests - MIT Licensed */

import { summary } from "@actions/core";
import { describe, expect, test, vi } from "vitest";
import { generateAutoModeSummary } from "../../src/reporters/summary.ts";
import type { ActionInputs, MinifyResult } from "../../src/types.ts";

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
