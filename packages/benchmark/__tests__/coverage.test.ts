import { describe, expect, test, vi } from "vitest";
import * as compressorLoader from "../src/compressor-loader.ts";
import { loadCompressor } from "../src/compressor-loader.ts";
import { formatConsoleOutput } from "../src/reporters/console.ts";
import { formatMarkdownOutput } from "../src/reporters/markdown.ts";
import { runBenchmark } from "../src/runner.ts";

vi.mock("node:fs", async () => {
    const actual = await vi.importActual<any>("node:fs");
    return {
        ...actual,
        statSync: vi.fn((file) => {
            if (
                file === "expanded.js" ||
                file === "src/index.ts" ||
                file === "mock-glob"
            ) {
                return { size: 100 };
            }
            if (String(file).endsWith(".tmp")) {
                return { size: 50 };
            }
            return actual.statSync(file);
        }),
        existsSync: vi.fn((file) => {
            if (
                file === "expanded.js" ||
                file === "src/index.ts" ||
                file === "mock-glob"
            )
                return true;
            return actual.existsSync(file);
        }),
        unlinkSync: vi.fn(),
    };
});

vi.mock("@node-minify/utils", async () => {
    const actual = await vi.importActual<any>("@node-minify/utils");
    return {
        ...actual,
        getFilesizeGzippedInBytes: vi.fn().mockResolvedValue("100 B"),
        getFilesizeBrotliInBytes: vi.fn().mockResolvedValue("90 B"),
        getContentFromFilesAsync: vi.fn().mockResolvedValue("mock content"),
        wildcards: vi.fn(async (pattern) => {
            if (pattern === "mock-glob") return ["expanded.js"];
            if (typeof actual.wildcards === "function")
                return actual.wildcards(pattern);
            return { input: [pattern] };
        }),
    };
});

vi.mock("@node-minify/fake-compressor", () => ({
    default: async () => ({ code: "mocked" }),
}));

describe("Coverage Gaps", () => {
    test("runner - branches (wildcards array return, default iterations)", async () => {
        vi.spyOn(compressorLoader, "loadCompressor").mockResolvedValue(
            async () => ({ code: "" })
        );

        const result = await runBenchmark({
            input: "mock-glob",
            compressors: ["fake"],
        });

        expect(result.files.length).toBe(1);
        expect(result.files[0]?.file).toBe("mock-glob");
        expect(result.options.iterations).toBeUndefined();
    });

    test("loadCompressor - unknown compressor name but package exists (default export)", async () => {
        const compressor = await loadCompressor("fake-compressor");
        expect(compressor).toBeDefined();
    });

    test("loadCompressor - falls back to mod.default when no named export", async () => {
        vi.doMock("@node-minify/unknown-pkg", () => ({
            default: async () => ({ code: "default-export" }),
        }));

        const { loadCompressor: loadComp } = await import(
            "../src/compressor-loader.ts"
        );
        const compressor = await loadComp("unknown-pkg");
        expect(compressor).toBeDefined();
    });

    test("runBenchmark - handles non-Error throw in compressor", async () => {
        vi.spyOn(compressorLoader, "loadCompressor").mockResolvedValue(
            async () => {
                throw "String error";
            }
        );

        const result = await runBenchmark({
            input: ["packages/benchmark/package.json"],
            compressors: ["fail-string"],
            iterations: 1,
        });

        expect(result.files[0]?.results[0]?.error).toBe("String error");
        expect(result.files[0]?.results[0]?.success).toBe(false);
    });

    test("Reporters - handles gzip/brotli columns and errors", () => {
        const mockResult = {
            timestamp: "2024-01-01",
            options: { verbose: true },
            summary: {
                bestCompression: "A",
                bestPerformance: "A",
                recommended: "A",
            },
            files: [
                {
                    file: "test.js",
                    originalSize: "1 KB",
                    originalSizeBytes: 1024,
                    results: [
                        {
                            compressor: "A",
                            size: "0.5 KB",
                            sizeBytes: 512,
                            reductionPercent: 50,
                            timeMs: 100,
                            success: true,
                            gzipSize: "0.3 KB",
                            brotliSize: "0.2 KB",
                            iterationTimes: [90, 110],
                        },
                        {
                            compressor: "B",
                            size: "0 B",
                            sizeBytes: 0,
                            reductionPercent: 0,
                            timeMs: 0,
                            success: false,
                            error: "Failed",
                        },
                    ],
                },
            ],
        };

        const consoleOut = formatConsoleOutput(mockResult as any);
        expect(consoleOut).toContain("Gzip");
        expect(consoleOut).toContain("Brotli");
        expect(consoleOut).toContain("0.3 KB");
        expect(consoleOut).toContain("0.2 KB");
        expect(consoleOut).toContain("Failed");
        expect(consoleOut).toContain("90ms, 110ms");

        const markdownOut = formatMarkdownOutput(mockResult as any);
        expect(markdownOut).toContain("| Gzip |");
        expect(markdownOut).toContain("| Brotli |");
        expect(markdownOut).toContain("| 0.3 KB |");
        expect(markdownOut).toContain("| 0.2 KB |");
        expect(markdownOut).toContain("- | - | ERROR: Failed |");
    });

    test("Reporters - verbose output", () => {
        const mockResult = {
            timestamp: "2024-01-01",
            options: { verbose: true },
            summary: {
                bestCompression: "A",
                bestPerformance: "A",
                recommended: "A",
            },
            files: [
                {
                    file: "test.js",
                    originalSize: "1KB",
                    originalSizeBytes: 1000,
                    results: [
                        {
                            compressor: "A",
                            size: "500B",
                            sizeBytes: 500,
                            reductionPercent: 50,
                            timeMs: 100,
                            success: true,
                            iterationTimes: [100],
                        },
                    ],
                },
            ],
        };
        const output = formatConsoleOutput(mockResult as any);
        expect(output).toContain("└─ 100ms");
    });
});
