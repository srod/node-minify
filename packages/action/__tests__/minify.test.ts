/*! node-minify action tests - MIT Licensed */

import { stat } from "node:fs/promises";
import { minify } from "@node-minify/core";
import { getFilesizeGzippedRaw, resolveCompressor } from "@node-minify/utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { runMinification } from "../src/minify.ts";

vi.mock("node:fs/promises");
vi.mock("@node-minify/core");
vi.mock("@node-minify/utils");

describe("runMinification", () => {
    const mockInputs = {
        input: "src/app.js",
        output: "dist/app.min.js",
        compressor: "terser",
        type: undefined,
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
        auto: false,
        outputDir: "dist",
        dryRun: false,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("should throw error if input is missing", async () => {
        const inputs = { ...mockInputs, input: "" };
        await expect(runMinification(inputs)).rejects.toThrow(
            "Input and output files are required for explicit mode"
        );
    });

    test("should throw error if output is missing", async () => {
        const inputs = { ...mockInputs, output: "" };
        await expect(runMinification(inputs)).rejects.toThrow(
            "Input and output files are required for explicit mode"
        );
    });

    test("should perform basic minification and calculate sizes", async () => {
        vi.mocked(stat)
            .mockResolvedValueOnce({ size: 1000 } as any)
            .mockResolvedValueOnce({ size: 500 } as any);
        vi.mocked(resolveCompressor).mockResolvedValue({
            compressor: vi.fn(),
            label: "terser",
        } as any);
        vi.mocked(minify).mockResolvedValue("minified content");
        vi.mocked(getFilesizeGzippedRaw).mockResolvedValue(300);

        const result = await runMinification(mockInputs);

        expect(result).toEqual({
            files: [
                {
                    file: "src/app.js",
                    originalSize: 1000,
                    minifiedSize: 500,
                    reduction: 50,
                    gzipSize: 300,
                    timeMs: expect.any(Number),
                },
            ],
            compressor: "terser",
            totalOriginalSize: 1000,
            totalMinifiedSize: 500,
            totalReduction: 50,
            totalTimeMs: expect.any(Number),
        });
    });

    test("should include gzip size when includeGzip is true", async () => {
        vi.mocked(stat)
            .mockResolvedValueOnce({ size: 1000 } as any)
            .mockResolvedValueOnce({ size: 500 } as any);
        vi.mocked(resolveCompressor).mockResolvedValue({
            compressor: vi.fn(),
            label: "terser",
        } as any);
        vi.mocked(getFilesizeGzippedRaw).mockResolvedValue(300);

        const result = await runMinification({
            ...mockInputs,
            includeGzip: true,
        });
        const fileResult = result.files[0];
        expect(fileResult).toBeDefined();
        expect(fileResult?.gzipSize).toBe(300);
        expect(getFilesizeGzippedRaw).toHaveBeenCalled();
    });

    test("should skip gzip size when includeGzip is false", async () => {
        vi.mocked(stat)
            .mockResolvedValueOnce({ size: 1000 } as any)
            .mockResolvedValueOnce({ size: 500 } as any);
        vi.mocked(resolveCompressor).mockResolvedValue({
            compressor: vi.fn(),
            label: "terser",
        } as any);

        const result = await runMinification({
            ...mockInputs,
            includeGzip: false,
        });
        const fileResult = result.files[0];
        expect(fileResult).toBeDefined();
        expect(fileResult?.gzipSize).toBeUndefined();
        expect(getFilesizeGzippedRaw).not.toHaveBeenCalled();
    });

    test("should calculate zero reduction when sizes are equal", async () => {
        vi.mocked(stat)
            .mockResolvedValueOnce({ size: 1000 } as any)
            .mockResolvedValueOnce({ size: 1000 } as any);
        vi.mocked(resolveCompressor).mockResolvedValue({
            compressor: vi.fn(),
            label: "terser",
        } as any);

        const result = await runMinification(mockInputs);
        expect(result.totalReduction).toBe(0);
    });

    test("should handle zero original size", async () => {
        vi.mocked(stat)
            .mockResolvedValueOnce({ size: 0 } as any)
            .mockResolvedValueOnce({ size: 0 } as any);
        vi.mocked(resolveCompressor).mockResolvedValue({
            compressor: vi.fn(),
            label: "terser",
        } as any);

        const result = await runMinification(mockInputs);
        expect(result.totalReduction).toBe(0);
    });

    test("should pass type and options to minify", async () => {
        vi.mocked(stat).mockResolvedValue({ size: 100 } as any);
        const mockComp = vi.fn();
        vi.mocked(resolveCompressor).mockResolvedValue({
            compressor: mockComp,
            label: "esbuild",
        } as any);

        const inputs = {
            ...mockInputs,
            compressor: "esbuild",
            type: "js" as const,
            options: { minify: true },
        };

        await runMinification(inputs);

        expect(minify).toHaveBeenCalledWith(
            expect.objectContaining({
                compressor: mockComp,
                type: "js",
                options: { minify: true },
            })
        );
    });
});
