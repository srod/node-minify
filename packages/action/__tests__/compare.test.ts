/*! node-minify action tests - MIT Licensed */

import { describe, expect, test } from "vitest";
import {
    calculateTotalChange,
    formatChange,
    hasIncrease,
} from "../src/compare.ts";
import type { ComparisonResult } from "../src/types.ts";

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
