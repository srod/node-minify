/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import {
    calculateRecommendedScore,
    calculateReduction,
} from "../src/metrics.ts";

describe("Metrics - calculateReduction", () => {
    test("should calculate reduction percentage correctly", () => {
        const reduction = calculateReduction(100, 70);
        expect(reduction).toBe(30);
    });

    test("should calculate reduction when compressed is zero", () => {
        const reduction = calculateReduction(100, 0);
        expect(reduction).toBe(100);
    });

    test("should return 0 when original size is zero", () => {
        const reduction = calculateReduction(0, 0);
        expect(reduction).toBe(0);
    });

    test("should return 0 when compressed equals original", () => {
        const reduction = calculateReduction(100, 100);
        expect(reduction).toBe(0);
    });

    test("should handle negative compression (larger output)", () => {
        const reduction = calculateReduction(100, 120);
        expect(reduction).toBe(-20);
    });

    test("should handle very small sizes", () => {
        const reduction = calculateReduction(10, 1);
        expect(reduction).toBe(90);
    });

    test("should handle very large sizes", () => {
        const reduction = calculateReduction(1000000, 300000);
        expect(reduction).toBe(70);
    });

    test("should handle decimal sizes", () => {
        const reduction = calculateReduction(100.5, 50.25);
        expect(reduction).toBe(50);
    });
});

describe("Metrics - calculateRecommendedScore", () => {
    test("should balance speed and compression", () => {
        const score1 = calculateRecommendedScore(100, 70);
        const score2 = calculateRecommendedScore(50, 65);

        expect(score2).toBeGreaterThan(score1);
    });

    test("should balance speed and compression weights correctly", () => {
        const fastLowCompression = calculateRecommendedScore(10, 50);
        const slowHighCompression = calculateRecommendedScore(100, 80);

        expect(fastLowCompression).toBeGreaterThan(slowHighCompression);
    });

    test("should handle very fast compression", () => {
        const score = calculateRecommendedScore(1, 50);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeGreaterThan(100);
    });

    test("should handle very slow compression", () => {
        const score = calculateRecommendedScore(1000, 90);
        expect(score).toBeGreaterThan(0);
    });

    test("should handle zero time", () => {
        const score = calculateRecommendedScore(0, 70);
        expect(score).toBeGreaterThan(0);
    });

    test("should handle zero reduction", () => {
        const score = calculateRecommendedScore(100, 0);
        expect(score).toBeGreaterThan(0);
    });

    test("should return reasonable scores", () => {
        const score = calculateRecommendedScore(100, 70);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThan(100);
    });

    test("should be deterministic", () => {
        const score1 = calculateRecommendedScore(100, 70);
        const score2 = calculateRecommendedScore(100, 70);

        expect(score1).toBe(score2);
    });
});
