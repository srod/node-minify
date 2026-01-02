/**
 * Calculate the percentage reduction from an original value to a compressed value.
 *
 * @param original - Baseline value (if `0`, the function returns `0`)
 * @param compressed - Value after compression to compare against `original`
 * @returns The reduction percentage computed as ((original - compressed) / original) * 100; `0` if `original` is `0`
 */

export function calculateReduction(
    original: number,
    compressed: number
): number {
    if (original === 0) return 0;
    return ((original - compressed) / original) * 100;
}

/**
 * Compute a composite score that balances execution speed and size reduction.
 *
 * @param timeMs - Execution time in milliseconds used to compute the speed component.
 * @param reductionPercent - Size reduction expressed as a percentage (0–100) used as the compression component.
 * @returns A numeric score formed as a weighted sum: 40% from the speed component (1000 / (timeMs + 1)) and 60% from `reductionPercent`.
 */
export function calculateRecommendedScore(
    timeMs: number,
    reductionPercent: number
): number {
    const speedScore = 1000 / (timeMs + 1);
    const compressionScore = reductionPercent;
    return speedScore * 0.4 + compressionScore * 0.6;
}