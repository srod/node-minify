/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { ActionInputs } from "./types.ts";

/**
 * Check whether a percent reduction violates configured thresholds.
 *
 * @param reduction - Percent change in size after minification (positive means size decreased; negative means size increased)
 * @param inputs - Configuration with:
 *   - `failOnIncrease`: if true, treat any increase (negative `reduction`) as a violation
 *   - `minReduction`: minimum allowed reduction percentage; values below this are violations when > 0
 * @returns A human-readable error message describing the threshold violation, or `null` if no violation
 */
export function checkThresholds(
    reduction: number,
    inputs: Pick<ActionInputs, "failOnIncrease" | "minReduction">
): string | null {
    if (inputs.failOnIncrease && reduction < 0) {
        return `Minified size is larger than original (${Math.abs(reduction).toFixed(1)}% increase)`;
    }

    if (inputs.minReduction > 0 && reduction < inputs.minReduction) {
        return `Reduction ${reduction.toFixed(1)}% is below minimum threshold ${inputs.minReduction}%`;
    }

    return null;
}
