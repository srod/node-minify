/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import type { ActionInputs } from "./types.ts";

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
