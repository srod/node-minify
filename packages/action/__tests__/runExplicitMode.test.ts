/*! node-minify action tests - MIT Licensed */

import * as core from "@actions/core";
import { context } from "@actions/github";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { addAnnotations } from "../src/annotations.ts";
import { runBenchmark } from "../src/benchmark.ts";
import { checkThresholds } from "../src/checks.ts";
import { postPRComment } from "../src/comment.ts";
import { compareWithBase } from "../src/compare.ts";
import { runExplicitMode } from "../src/index.ts";
import { validateCompressor } from "../src/inputs.ts";
import { runMinification } from "../src/minify.ts";
import { setBenchmarkOutputs, setMinifyOutputs } from "../src/outputs.ts";
import {
    generateBenchmarkSummary,
    generateSummary,
} from "../src/reporters/summary.ts";
import type {
    ActionInputs,
    BenchmarkResult,
    ComparisonResult,
    MinifyResult,
} from "../src/types.ts";

vi.mock("@actions/core");
vi.mock("@actions/github");
vi.mock("../src/minify.ts");
vi.mock("../src/outputs.ts");
vi.mock("../src/checks.ts");
vi.mock("../src/reporters/summary.ts");
vi.mock("../src/comment.ts");
vi.mock("../src/annotations.ts");
vi.mock("../src/benchmark.ts");
vi.mock("../src/compare.ts");
vi.mock("../src/inputs.ts");

describe("runExplicitMode", () => {
    const mockInputs: ActionInputs = {
        compressor: "terser",
        input: "src/app.js",
        output: "dist/app.min.js",
        type: undefined,
        options: {},
        reportSummary: true,
        reportPRComment: false,
        reportAnnotations: false,
        benchmark: false,
        benchmarkCompressors: [],
        workingDirectory: ".",
        includeGzip: true,
        failOnIncrease: false,
        minReduction: 0,
        githubToken: "token",
        // Auto mode fields (unused but required)
        auto: false,
        patterns: [],
        outputDir: "dist",
        additionalIgnore: [],
        dryRun: false,
    };

    const mockResult: MinifyResult = {
        files: [
            {
                file: "src/app.js",
                originalSize: 1000,
                minifiedSize: 500,
                reduction: 50,
                gzipSize: 300,
                timeMs: 100,
            },
        ],
        compressor: "terser",
        totalOriginalSize: 1000,
        totalMinifiedSize: 500,
        totalReduction: 50,
        totalTimeMs: 100,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(validateCompressor).mockImplementation(() => {});
        vi.mocked(runMinification).mockResolvedValue(mockResult);
        vi.mocked(checkThresholds).mockReturnValue(null);
        // Reset context
        (context as { payload: Record<string, unknown> }).payload = {};
    });

    test("1. Compressor validation error", async () => {
        vi.mocked(validateCompressor).mockImplementation(() => {
            throw new Error("Invalid compressor");
        });

        await expect(runExplicitMode(mockInputs)).rejects.toThrow(
            "Invalid compressor"
        );
        expect(validateCompressor).toHaveBeenCalledWith(mockInputs.compressor);
    });

    test("2. Basic minification with outputs set", async () => {
        await runExplicitMode({ ...mockInputs, reportSummary: false });

        expect(runMinification).toHaveBeenCalledWith(
            expect.objectContaining({ compressor: "terser" })
        );
        expect(setMinifyOutputs).toHaveBeenCalledWith(mockResult);
        expect(core.info).toHaveBeenCalledWith(
            expect.stringContaining("Minifying src/app.js with terser...")
        );
    });

    test("3. Summary report generation (when enabled)", async () => {
        await runExplicitMode({ ...mockInputs, reportSummary: true });

        expect(generateSummary).toHaveBeenCalledWith(mockResult);
    });

    test("4. PR comment posting (when in PR context + enabled)", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { number: 123 },
        };
        const comparisons: ComparisonResult[] = [
            {
                file: "src/app.js",
                baseSize: 1200,
                currentSize: 1000,
                change: -16.7,
                isNew: false,
            },
        ];
        vi.mocked(compareWithBase).mockResolvedValue(comparisons);

        await runExplicitMode({ ...mockInputs, reportPRComment: true });

        expect(compareWithBase).toHaveBeenCalledWith(mockResult, "token");
        expect(postPRComment).toHaveBeenCalledWith(
            mockResult,
            "token",
            comparisons
        );
    });

    test("5. Annotations reporting (when enabled)", async () => {
        await runExplicitMode({ ...mockInputs, reportAnnotations: true });

        expect(addAnnotations).toHaveBeenCalledWith(mockResult);
    });

    test("6. Benchmark mode disabled (skip benchmark)", async () => {
        await runExplicitMode({ ...mockInputs, benchmark: false });

        expect(runBenchmark).not.toHaveBeenCalled();
        expect(setBenchmarkOutputs).not.toHaveBeenCalled();
    });

    test("7. Benchmark mode enabled with multiple compressors", async () => {
        const benchmarkResult: BenchmarkResult = {
            file: "src/app.js",
            originalSize: 1000,
            compressors: [],
            recommended: "esbuild",
            bestCompression: "esbuild",
            bestSpeed: "swc",
        };
        vi.mocked(runBenchmark).mockResolvedValue(benchmarkResult);
        const inputs = {
            ...mockInputs,
            benchmark: true,
            benchmarkCompressors: ["terser", "esbuild"],
        };

        await runExplicitMode(inputs);

        expect(runBenchmark).toHaveBeenCalledWith(inputs);
        expect(setBenchmarkOutputs).toHaveBeenCalledWith(benchmarkResult);
        expect(generateBenchmarkSummary).toHaveBeenCalledWith(benchmarkResult);
        expect(core.info).toHaveBeenCalledWith(
            expect.stringContaining(
                "Running benchmark with compressors: terser, esbuild..."
            )
        );
    });

    test("8. Benchmark winner logging", async () => {
        const benchmarkResult: BenchmarkResult = {
            file: "src/app.js",
            originalSize: 1000,
            compressors: [],
            recommended: "esbuild",
        };
        vi.mocked(runBenchmark).mockResolvedValue(benchmarkResult);

        await runExplicitMode({ ...mockInputs, benchmark: true });

        expect(core.info).toHaveBeenCalledWith("🏆 Benchmark winner: esbuild");
    });

    test("9. Threshold check passes", async () => {
        vi.mocked(checkThresholds).mockReturnValue(null);

        await runExplicitMode(mockInputs);

        expect(core.setFailed).not.toHaveBeenCalled();
        expect(core.info).toHaveBeenCalledWith(
            expect.stringContaining("✅ Minification complete!")
        );
    });

    test("10. Threshold check fails (calls setFailed)", async () => {
        vi.mocked(checkThresholds).mockReturnValue(
            "Reduction 50% is below minimum 60%"
        );

        await runExplicitMode(mockInputs);

        expect(core.setFailed).toHaveBeenCalledWith(
            "Reduction 50% is below minimum 60%"
        );
    });

    test("11. No PR comment when not in PR context", async () => {
        (context as { payload: Record<string, unknown> }).payload = {}; // No pull_request

        await runExplicitMode({ ...mockInputs, reportPRComment: true });

        expect(compareWithBase).not.toHaveBeenCalled();
        expect(postPRComment).not.toHaveBeenCalled();
    });

    test("12. Combined: summary + PR comment + annotations", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { number: 123 },
        };
        const inputs = {
            ...mockInputs,
            reportSummary: true,
            reportPRComment: true,
            reportAnnotations: true,
        };

        await runExplicitMode(inputs);

        expect(generateSummary).toHaveBeenCalled();
        expect(postPRComment).toHaveBeenCalled();
        expect(addAnnotations).toHaveBeenCalled();
    });
});
