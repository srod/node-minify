/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { error, notice, warning } from "@actions/core";
import type { MinifyResult } from "../types.ts";

const LOW_REDUCTION_THRESHOLD = 20;
const VERY_LOW_REDUCTION_THRESHOLD = 5;

export function addAnnotations(result: MinifyResult): void {
    for (const file of result.files) {
        if (file.reduction < VERY_LOW_REDUCTION_THRESHOLD) {
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

        if (file.reduction < 0) {
            error(
                `Minified file is larger than original (${file.reduction.toFixed(1)}% increase). ` +
                    `This may indicate an issue with the compressor settings.`,
                { file: file.file }
            );
        }
    }
}

export function addErrorAnnotation(file: string, errorMsg: string): void {
    error(`Minification failed: ${errorMsg}`, { file });
}
