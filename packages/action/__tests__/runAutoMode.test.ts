/*! node-minify action tests - MIT Licensed */

import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import * as core from "@actions/core";
import { minify } from "@node-minify/core";
import { getFilesizeGzippedRaw, resolveCompressor } from "@node-minify/utils";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { groupFilesByType, selectCompressor } from "../src/autoDetect.ts";
import { checkThresholds } from "../src/checks.ts";
import { discoverFiles, generateOutputPath } from "../src/discover.ts";
import { runAutoMode } from "../src/index.ts";
import { setMinifyOutputs } from "../src/outputs.ts";
import { generateSummary } from "../src/reporters/summary.ts";

vi.mock("@actions/core");
vi.mock("@actions/github");
vi.mock("node:fs/promises");
vi.mock("../src/discover.ts");
vi.mock("../src/autoDetect.ts");
vi.mock("@node-minify/utils");
vi.mock("@node-minify/core");
vi.mock("../src/outputs.ts");
vi.mock("../src/checks.ts");
vi.mock("../src/reporters/summary.ts");

describe("runAutoMode", () => {
    const mockInputs = {
        auto: true,
        patterns: ["**/*.js"],
        outputDir: "dist",
        additionalIgnore: [],
        workingDirectory: ".",
        dryRun: false,
        reportSummary: true,
        reportPRComment: false,
        reportAnnotations: false,
        failOnIncrease: false,
        minReduction: 0,
        includeGzip: true,
        compressor: "terser",
        input: "",
        output: "",
        type: undefined,
        options: {},
        benchmark: false,
        benchmarkCompressors: [],
        githubToken: undefined,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(stat).mockResolvedValue({ size: 100 } as any);
        vi.mocked(resolveCompressor).mockResolvedValue({
            compressor: vi.fn(),
            label: "terser",
        } as any);
        vi.mocked(selectCompressor).mockReturnValue({
            compressor: "terser",
            package: "@node-minify/terser",
        });
        vi.mocked(generateOutputPath).mockImplementation(
            (file) => `min/${file}`
        );
        vi.mocked(minify).mockResolvedValue("minified content");
        vi.mocked(checkThresholds).mockReturnValue(null);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: [],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
    });

    test("should set empty outputs when no files found", async () => {
        vi.mocked(discoverFiles).mockReturnValue([]);

        await runAutoMode(mockInputs);

        expect(core.warning).toHaveBeenCalledWith(
            "No files found matching patterns"
        );
        expect(setMinifyOutputs).toHaveBeenCalledWith({
            files: [],
            compressor: "auto",
            totalOriginalSize: 0,
            totalMinifiedSize: 0,
            totalReduction: 0,
            totalTimeMs: 0,
        });
    });

    test("should only log info in dry-run mode", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js", "file2.js"]);
        const inputs = { ...mockInputs, dryRun: true };

        await runAutoMode(inputs);

        expect(core.info).toHaveBeenCalledWith(
            "[dry-run] Would process 2 files"
        );
        expect(minify).not.toHaveBeenCalled();
    });

    test("should throw error if compressor is not found", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(resolveCompressor).mockRejectedValueOnce(
            new Error("Not found")
        );

        await expect(runAutoMode(mockInputs)).rejects.toThrow(
            "Compressor for js files not found. Run: npm install @node-minify/terser"
        );
    });

    test("should create output directory", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });

        await runAutoMode(mockInputs);

        expect(mkdir).toHaveBeenCalledWith("dist", { recursive: true });
    });

    test("should process files and set outputs", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(stat).mockResolvedValueOnce({ size: 100 } as any);
        vi.mocked(stat).mockResolvedValueOnce({ size: 50 } as any);

        await runAutoMode(mockInputs);

        expect(minify).toHaveBeenCalled();
        expect(setMinifyOutputs).toHaveBeenCalledWith(
            expect.objectContaining({
                totalOriginalSize: 100,
                totalMinifiedSize: 50,
                totalReduction: 50,
            })
        );
    });

    test("should handle mixed file types", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js", "style.css"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: ["style.css"],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(selectCompressor).mockImplementation((type) => {
            if (type === "js")
                return { compressor: "terser", package: "@node-minify/terser" };
            if (type === "css")
                return {
                    compressor: "lightningcss",
                    package: "@node-minify/lightningcss",
                };
            return {
                compressor: "no-compress",
                package: "@node-minify/no-compress",
            };
        });

        await runAutoMode(mockInputs);

        expect(minify).toHaveBeenCalledTimes(2);
    });

    test("should process files in chunks", async () => {
        const files = ["f1.js", "f2.js", "f3.js", "f4.js", "f5.js"];
        vi.mocked(discoverFiles).mockReturnValue(files);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: files,
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });

        await runAutoMode(mockInputs);

        expect(minify).toHaveBeenCalledTimes(5);
    });

    test("should handle partial failures", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["success.js", "fail.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["success.js", "fail.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(minify).mockResolvedValueOnce("");
        vi.mocked(minify).mockRejectedValueOnce(new Error("Minify failed"));

        await runAutoMode(mockInputs);

        expect(core.warning).toHaveBeenCalledWith("1 files failed to minify:");
        expect(core.warning).toHaveBeenCalledWith("  - fail.js: Minify failed");
        expect(setMinifyOutputs).toHaveBeenCalledWith(
            expect.objectContaining({
                files: expect.arrayContaining([
                    expect.objectContaining({ file: "success.js" }),
                ]),
            })
        );
    });

    test("should call setFailed when all files fail", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["fail.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["fail.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(minify).mockRejectedValue(new Error("Minify failed"));

        await runAutoMode(mockInputs);

        expect(core.setFailed).toHaveBeenCalledWith(
            "All files failed to minify"
        );
    });

    test("should include gzip size when requested", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(getFilesizeGzippedRaw).mockResolvedValue(20);

        await runAutoMode({ ...mockInputs, includeGzip: true });

        expect(getFilesizeGzippedRaw).toHaveBeenCalled();
        expect(setMinifyOutputs).toHaveBeenCalledWith(
            expect.objectContaining({
                files: [expect.objectContaining({ gzipSize: 20 })],
            })
        );
    });

    test("should not include gzip size when disabled", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });

        await runAutoMode({ ...mockInputs, includeGzip: false });

        expect(getFilesizeGzippedRaw).not.toHaveBeenCalled();
    });

    test("should handle 0 byte files", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["empty.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["empty.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(stat).mockResolvedValue({ size: 0 } as any);

        await runAutoMode(mockInputs);

        expect(setMinifyOutputs).toHaveBeenCalledWith(
            expect.objectContaining({
                totalReduction: 0,
            })
        );
    });

    test("should call generateSummary when reportSummary is true", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });

        await runAutoMode({ ...mockInputs, reportSummary: true });

        expect(generateSummary).toHaveBeenCalled();
    });

    test("should not call generateSummary when reportSummary is false", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });

        await runAutoMode({ ...mockInputs, reportSummary: false });

        expect(generateSummary).not.toHaveBeenCalled();
    });

    test("should call setFailed when threshold check fails", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        vi.mocked(checkThresholds).mockReturnValue("Threshold exceeded");

        await runAutoMode(mockInputs);

        expect(core.setFailed).toHaveBeenCalledWith("Threshold exceeded");
    });

    test("should use correct paths with workingDirectory", async () => {
        vi.mocked(discoverFiles).mockReturnValue(["file1.js"]);
        vi.mocked(groupFilesByType).mockReturnValue({
            js: ["file1.js"],
            css: [],
            html: [],
            json: [],
            svg: [],
            unknown: [],
        });
        const inputs = { ...mockInputs, workingDirectory: "src" };

        await runAutoMode(inputs);

        expect(mkdir).toHaveBeenCalledWith(path.join("src", "dist"), {
            recursive: true,
        });
    });
});
