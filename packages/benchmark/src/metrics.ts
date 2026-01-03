/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

export function calculateReduction(
    original: number,
    compressed: number
): number {
    if (original === 0) return 0;
    return ((original - compressed) / original) * 100;
}

export function calculateRecommendedScore(
    timeMs: number,
    reductionPercent: number
): number {
    const speedScore = 1000 / (timeMs + 1);
    const compressionScore = reductionPercent;
    return speedScore * 0.4 + compressionScore * 0.6;
}
