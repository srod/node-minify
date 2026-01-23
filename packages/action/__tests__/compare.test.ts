/*! node-minify action tests - MIT Licensed */

import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@actions/core", () => ({
    info: vi.fn(),
    warning: vi.fn(),
}));

vi.mock("@actions/github", () => ({
    context: {
        payload: {},
        repo: { owner: "test-owner", repo: "test-repo" },
    },
    getOctokit: vi.fn(),
}));

import { info, warning } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import {
    calculateTotalChange,
    compareWithBase,
    formatChange,
    hasIncrease,
} from "../src/compare.ts";
import type { ComparisonResult, MinifyResult } from "../src/types.ts";

describe("formatChange", () => {
    test("formats size increase with warning emoji", () => {
        const comparison: ComparisonResult = {
            file: "app.min.js",
            baseSize: 1000,
            currentSize: 1050,
            change: 5,
            isNew: false,
        };
        expect(formatChange(comparison)).toBe("+5.0% ⚠️");
    });

    test("formats size decrease with success emoji", () => {
        const comparison: ComparisonResult = {
            file: "app.min.js",
            baseSize: 1000,
            currentSize: 900,
            change: -10,
            isNew: false,
        };
        expect(formatChange(comparison)).toBe("-10.0% ✅");
    });

    test("formats no change", () => {
        const comparison: ComparisonResult = {
            file: "app.min.js",
            baseSize: 1000,
            currentSize: 1000,
            change: 0,
            isNew: false,
        };
        expect(formatChange(comparison)).toBe("+0.0% ✅");
    });

    test("returns 'new' for new files", () => {
        const comparison: ComparisonResult = {
            file: "app.min.js",
            baseSize: null,
            currentSize: 1000,
            change: null,
            isNew: true,
        };
        expect(formatChange(comparison)).toBe("new");
    });

    test("returns 'new' when change is null", () => {
        const comparison: ComparisonResult = {
            file: "app.min.js",
            baseSize: null,
            currentSize: 500,
            change: null,
            isNew: false,
        };
        expect(formatChange(comparison)).toBe("new");
    });
});

describe("hasIncrease", () => {
    test("detects size increase", () => {
        const comparisons: ComparisonResult[] = [
            {
                file: "a.js",
                baseSize: 1000,
                currentSize: 900,
                change: -10,
                isNew: false,
            },
            {
                file: "b.js",
                baseSize: 1000,
                currentSize: 1100,
                change: 10,
                isNew: false,
            },
        ];
        expect(hasIncrease(comparisons)).toBe(true);
    });

    test("returns false when all files decreased", () => {
        const comparisons: ComparisonResult[] = [
            {
                file: "a.js",
                baseSize: 1000,
                currentSize: 900,
                change: -10,
                isNew: false,
            },
            {
                file: "b.js",
                baseSize: 1000,
                currentSize: 950,
                change: -5,
                isNew: false,
            },
        ];
        expect(hasIncrease(comparisons)).toBe(false);
    });

    test("ignores new files", () => {
        const comparisons: ComparisonResult[] = [
            {
                file: "a.js",
                baseSize: null,
                currentSize: 1000,
                change: null,
                isNew: true,
            },
        ];
        expect(hasIncrease(comparisons)).toBe(false);
    });

    test("returns false for empty array", () => {
        expect(hasIncrease([])).toBe(false);
    });
});

describe("calculateTotalChange", () => {
    test("calculates total change across files", () => {
        const comparisons: ComparisonResult[] = [
            {
                file: "a.js",
                baseSize: 1000,
                currentSize: 800,
                change: -20,
                isNew: false,
            },
            {
                file: "b.js",
                baseSize: 1000,
                currentSize: 900,
                change: -10,
                isNew: false,
            },
        ];

        const result = calculateTotalChange(comparisons);
        expect(result.totalBaseSize).toBe(2000);
        expect(result.totalCurrentSize).toBe(1700);
        expect(result.totalChangePercent).toBe(-15);
    });

    test("excludes new files from base calculation", () => {
        const comparisons: ComparisonResult[] = [
            {
                file: "existing.js",
                baseSize: 1000,
                currentSize: 800,
                change: -20,
                isNew: false,
            },
            {
                file: "new.js",
                baseSize: null,
                currentSize: 500,
                change: null,
                isNew: true,
            },
        ];

        const result = calculateTotalChange(comparisons);
        expect(result.totalBaseSize).toBe(1000);
        expect(result.totalCurrentSize).toBe(800);
        expect(result.totalChangePercent).toBe(-20);
    });

    test("handles all new files", () => {
        const comparisons: ComparisonResult[] = [
            {
                file: "a.js",
                baseSize: null,
                currentSize: 500,
                change: null,
                isNew: true,
            },
            {
                file: "b.js",
                baseSize: null,
                currentSize: 300,
                change: null,
                isNew: true,
            },
        ];

        const result = calculateTotalChange(comparisons);
        expect(result.totalBaseSize).toBe(0);
        expect(result.totalCurrentSize).toBe(800);
        expect(result.totalChangePercent).toBeNull();
    });

    test("handles empty array", () => {
        const result = calculateTotalChange([]);
        expect(result.totalBaseSize).toBe(0);
        expect(result.totalCurrentSize).toBe(0);
        expect(result.totalChangePercent).toBeNull();
    });

    test("handles size increase", () => {
        const comparisons: ComparisonResult[] = [
            {
                file: "a.js",
                baseSize: 1000,
                currentSize: 1200,
                change: 20,
                isNew: false,
            },
        ];

        const result = calculateTotalChange(comparisons);
        expect(result.totalChangePercent).toBe(20);
    });
});

describe("compareWithBase", () => {
    const mockResult: MinifyResult = {
        files: [
            {
                file: "dist/app.min.js",
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

    beforeEach(() => {
        vi.resetAllMocks();
        (context as { payload: Record<string, unknown> }).payload = {};
    });

    test("returns empty array when no token provided", async () => {
        const result = await compareWithBase(mockResult, undefined);

        expect(result).toEqual([]);
        expect(warning).toHaveBeenCalledWith(
            "No GitHub token provided, skipping base branch comparison"
        );
    });

    test("returns empty array when not a pull request", async () => {
        (context as { payload: Record<string, unknown> }).payload = {};

        const result = await compareWithBase(mockResult, "fake-token");

        expect(result).toEqual([]);
        expect(info).toHaveBeenCalledWith(
            "Not a pull request, skipping base branch comparison"
        );
    });

    test("compares files against base branch", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { base: { ref: "main" } },
        };

        const mockGetContent = vi.fn().mockResolvedValue({
            data: { type: "file", size: 3500 },
        });

        vi.mocked(getOctokit).mockReturnValue({
            rest: {
                repos: { getContent: mockGetContent },
            },
        } as unknown as ReturnType<typeof getOctokit>);

        const result = await compareWithBase(mockResult, "fake-token");

        expect(result).toHaveLength(1);
        expect(result[0]?.file).toBe("dist/app.min.js");
        expect(result[0]?.baseSize).toBe(3500);
        expect(result[0]?.currentSize).toBe(3000);
        expect(result[0]?.isNew).toBe(false);
        expect(result[0]?.change).toBeCloseTo(-14.29, 1);

        expect(mockGetContent).toHaveBeenCalledWith({
            owner: "test-owner",
            repo: "test-repo",
            path: "dist/app.min.js",
            ref: "main",
        });
    });

    test("handles new file (404 error)", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { base: { ref: "main" } },
        };

        const notFoundError = Object.assign(new Error("Not Found"), {
            status: 404,
        });
        const mockGetContent = vi.fn().mockRejectedValue(notFoundError);

        vi.mocked(getOctokit).mockReturnValue({
            rest: {
                repos: { getContent: mockGetContent },
            },
        } as unknown as ReturnType<typeof getOctokit>);

        const result = await compareWithBase(mockResult, "fake-token");

        expect(result).toHaveLength(1);
        expect(result[0]?.isNew).toBe(true);
        expect(result[0]?.baseSize).toBeNull();
        expect(result[0]?.change).toBeNull();
    });

    test("handles directory response as new file", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { base: { ref: "main" } },
        };

        const mockGetContent = vi.fn().mockResolvedValue({
            data: [{ type: "file", name: "index.js" }],
        });

        vi.mocked(getOctokit).mockReturnValue({
            rest: {
                repos: { getContent: mockGetContent },
            },
        } as unknown as ReturnType<typeof getOctokit>);

        const result = await compareWithBase(mockResult, "fake-token");

        expect(result[0]?.isNew).toBe(true);
    });

    test("handles symlink/submodule as new file", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { base: { ref: "main" } },
        };

        const mockGetContent = vi.fn().mockResolvedValue({
            data: { type: "symlink", target: "some-target" },
        });

        vi.mocked(getOctokit).mockReturnValue({
            rest: {
                repos: { getContent: mockGetContent },
            },
        } as unknown as ReturnType<typeof getOctokit>);

        const result = await compareWithBase(mockResult, "fake-token");

        expect(result[0]?.isNew).toBe(true);
    });

    test("handles unexpected errors gracefully", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { base: { ref: "main" } },
        };

        const unexpectedError = new Error("Network error");
        const mockGetContent = vi.fn().mockRejectedValue(unexpectedError);

        vi.mocked(getOctokit).mockReturnValue({
            rest: {
                repos: { getContent: mockGetContent },
            },
        } as unknown as ReturnType<typeof getOctokit>);

        const result = await compareWithBase(mockResult, "fake-token");

        expect(result[0]?.isNew).toBe(true);
        expect(warning).toHaveBeenCalledWith(
            expect.stringContaining("Failed to fetch base branch version")
        );
    });

    test("handles zero base size", async () => {
        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { base: { ref: "main" } },
        };

        const mockGetContent = vi.fn().mockResolvedValue({
            data: { type: "file", size: 0 },
        });

        vi.mocked(getOctokit).mockReturnValue({
            rest: {
                repos: { getContent: mockGetContent },
            },
        } as unknown as ReturnType<typeof getOctokit>);

        const result = await compareWithBase(mockResult, "fake-token");

        expect(result[0]?.baseSize).toBe(0);
        expect(result[0]?.change).toBe(100);
    });

    test("handles multiple files", async () => {
        const multiFileResult: MinifyResult = {
            files: [
                {
                    file: "dist/a.js",
                    originalSize: 5000,
                    minifiedSize: 1500,
                    reduction: 70,
                    timeMs: 25,
                },
                {
                    file: "dist/b.js",
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

        (context as { payload: Record<string, unknown> }).payload = {
            pull_request: { base: { ref: "main" } },
        };

        const mockGetContent = vi
            .fn()
            .mockResolvedValueOnce({ data: { type: "file", size: 1600 } })
            .mockResolvedValueOnce({ data: { type: "file", size: 1400 } });

        vi.mocked(getOctokit).mockReturnValue({
            rest: {
                repos: { getContent: mockGetContent },
            },
        } as unknown as ReturnType<typeof getOctokit>);

        const result = await compareWithBase(multiFileResult, "fake-token");

        expect(result).toHaveLength(2);
        expect(mockGetContent).toHaveBeenCalledTimes(2);
    });
});
