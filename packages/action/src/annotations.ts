/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { error, notice, warning } from "@actions/core";
import type { MinifyResult } from "./types.ts";

const LOW_REDUCTION_THRESHOLD = 20;
const VERY_LOW_REDUCTION_THRESHOLD = 5;

/**
 * Emit GitHub Actions annotations for each minified file based on its size reduction.
 *
 * For each file in `result.files` this reports an annotation scoped to that file:
 * - An error if the minified file is larger than the original.
 * - A warning if the reduction is very small, suggesting review for dead code or prior minification.
 * - A notice if the reduction is low, suggesting the file may already be optimized.
 *
 * @param result - Minification result containing an array of file reports with reduction percentages and file paths
 */
export function addAnnotations(result: MinifyResult): void {
    for (const file of result.files) {
        if (file.reduction < 0) {
            error(
                `Minified file is larger than original (${Math.abs(file.reduction).toFixed(1)}% increase). ` +
                    `This may indicate an issue with the compressor settings.`,
                { file: file.file }
            );
        } else if (file.reduction < VERY_LOW_REDUCTION_THRESHOLD) {
            warning(
                `Very low compression ratio (${file.reduction.toFixed(1)}%). ` +
                    `Consider reviewing for dead code or checking if file is already minified.`,
                { file: file.file }
            );
        } else if (file.reduction < LOW_REDUCTION_THRESHOLD) {
            notice(
                `Low compression ratio (${file.reduction.toFixed(1)}%). ` +
                    `File may already be optimized.`,
                { file: file.file }
            );
        }
    }
}

/**
 * Record an error annotation for a specific file indicating that minification failed.
 *
 * @param file - The file path to associate with the annotation
 * @param errorMsg - A human-readable message describing the minification error
 */
export function addErrorAnnotation(file: string, errorMsg: string): void {
    error(`Minification failed: ${errorMsg}`, { file });
}
