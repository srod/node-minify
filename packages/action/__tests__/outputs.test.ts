/*! node-minify action tests - MIT Licensed */

import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock @actions/core before importing
vi.mock("@actions/core", () => ({
    setOutput: vi.fn(),
}));

import { setOutput } from "@actions/core";
import { setBenchmarkOutputs, setMinifyOutputs } from "../src/outputs.ts";
import type { BenchmarkResult, MinifyResult } from "../src/types.ts";

describe("setMinifyOutputs", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("sets all basic outputs", () => {
        const result: MinifyResult = {
            files: [
                {
                    file: "app.js",
                    originalSize: 10000,
                    minifiedSize: 3000,
                    reduction: 70,
                    timeMs: 50,
                },
            ],
            compressor: "terser",
            totalOriginalSize: 10000,
            totalMinifiedSize: 3000,
            totalReduction: 70,
            totalTimeMs: 50,
        };

        setMinifyOutputs(result);

        expect(setOutput).toHaveBeenCalledWith("original-size", 10000);
        expect(setOutput).toHaveBeenCalledWith("minified-size", 3000);
        expect(setOutput).toHaveBeenCalledWith("reduction-percent", "70.00");
        expect(setOutput).toHaveBeenCalledWith("time-ms", 50);
        expect(setOutput).toHaveBeenCalledWith(
            "report-json",
            JSON.stringify(result)
        );
    });

    test("sets gzip-size when any file has gzipSize", () => {
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
                    gzipSize: 800,
                    timeMs: 25,
                },
            ],
            compressor: "terser",
            totalOriginalSize: 10000,
            totalMinifiedSize: 3000,
            totalReduction: 70,
            totalTimeMs: 50,
        };

        setMinifyOutputs(result);

        expect(setOutput).toHaveBeenCalledWith("gzip-size", 800);
    });

    test("does not set gzip-size when no file has gzipSize", () => {
        const result: MinifyResult = {
            files: [
                {
                    file: "app.js",
                    originalSize: 10000,
                    minifiedSize: 3000,
                    reduction: 70,
                    timeMs: 50,
                },
            ],
            compressor: "terser",
            totalOriginalSize: 10000,
            totalMinifiedSize: 3000,
            totalReduction: 70,
            totalTimeMs: 50,
        };

        setMinifyOutputs(result);

        expect(setOutput).not.toHaveBeenCalledWith(
            "gzip-size",
            expect.anything()
        );
    });
});

describe("setBenchmarkOutputs", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    test("sets benchmark winner when recommended", () => {
        const result: BenchmarkResult = {
            file: "app.js",
            originalSize: 10000,
            compressors: [],
            recommended: "terser",
            bestCompression: "terser",
            bestSpeed: "esbuild",
        };

        setBenchmarkOutputs(result);

        expect(setOutput).toHaveBeenCalledWith("benchmark-winner", "terser");
        expect(setOutput).toHaveBeenCalledWith("best-compression", "terser");
        expect(setOutput).toHaveBeenCalledWith("best-speed", "esbuild");
    });

    test("does not set outputs when values are undefined", () => {
        const result: BenchmarkResult = {
            file: "app.js",
            originalSize: 10000,
            compressors: [],
            recommended: undefined,
            bestCompression: undefined,
            bestSpeed: undefined,
        };

        setBenchmarkOutputs(result);

        expect(setOutput).not.toHaveBeenCalledWith(
            "benchmark-winner",
            expect.anything()
        );
        expect(setOutput).toHaveBeenCalledWith(
            "benchmark-json",
            JSON.stringify(result)
        );
    });
});
