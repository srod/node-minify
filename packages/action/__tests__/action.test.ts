/*! node-minify action tests - MIT Licensed */

import { describe, expect, test } from "vitest";
import { checkThresholds } from "../src/checks.ts";
import type { ActionInputs, FileResult, MinifyResult } from "../src/types.ts";

describe("Action Types", () => {
    test("ActionInputs has required fields", () => {
        const inputs: ActionInputs = {
            input: "src/app.js",
            output: "dist/app.min.js",
            compressor: "terser",
            options: {},
            reportSummary: true,
            reportPRComment: false,
            reportAnnotations: false,
            benchmark: false,
            benchmarkCompressors: ["terser", "esbuild"],
            failOnIncrease: false,
            minReduction: 0,
            includeGzip: true,
            workingDirectory: ".",
        };

        expect(inputs.input).toBe("src/app.js");
        expect(inputs.compressor).toBe("terser");
    });

    test("FileResult has all metrics", () => {
        const result: FileResult = {
            file: "app.js",
            originalSize: 10000,
            minifiedSize: 3000,
            reduction: 70,
            gzipSize: 1000,
            timeMs: 50,
        };

        expect(result.reduction).toBe(70);
        expect(result.gzipSize).toBe(1000);
    });

    test("MinifyResult aggregates file results", () => {
        const result: MinifyResult = {
            files: [
                {
                    file: "a.js",
                    originalSize: 5000,
                    minifiedSize: 1500,
                    reduction: 70,
                    timeMs: 25,
                },
                {
                    file: "b.js",
                    originalSize: 5000,
                    minifiedSize: 1500,
                    reduction: 70,
                    timeMs: 25,
                },
            ],
            compressor: "terser",
            totalOriginalSize: 10000,
            totalMinifiedSize: 3000,
            totalReduction: 70,
            totalTimeMs: 50,
        };

        expect(result.files).toHaveLength(2);
        expect(result.totalReduction).toBe(70);
    });
});

describe("Threshold Logic", () => {
    test("should detect size increase", () => {
        const reduction = -5;
        const inputs = {
            failOnIncrease: true,
            minReduction: 0,
        };

        const error = checkThresholds(reduction, inputs);
        expect(error).toContain("larger than original");
        expect(error).toContain("5.0% increase");
    });

    test("should detect insufficient reduction", () => {
        const reduction = 30;
        const inputs = {
            failOnIncrease: false,
            minReduction: 50,
        };

        const error = checkThresholds(reduction, inputs);
        expect(error).toContain("below minimum threshold");
    });

    test("should pass when reduction meets threshold", () => {
        const reduction = 60;
        const inputs = {
            failOnIncrease: false,
            minReduction: 50,
        };

        const error = checkThresholds(reduction, inputs);
        expect(error).toBeNull();
    });
});
