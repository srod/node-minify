/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { setOutput } from "@actions/core";
import type { BenchmarkResult, MinifyResult } from "./types.ts";

/**
 * Publishes minification metrics from a MinifyResult to GitHub Actions outputs.
 *
 * Sets the following outputs: `original-size`, `minified-size`, `reduction-percent` (formatted to two decimal places), `time-ms`, and `report-json`. If per-file gzip sizes are present, also sets `gzip-size` to the total gzip size across files.
 *
 * @param result - Minification summary containing total and per-file metrics used to populate action outputs
 */
export function setMinifyOutputs(result: MinifyResult): void {
    setOutput("original-size", result.totalOriginalSize);
    setOutput("minified-size", result.totalMinifiedSize);
    setOutput("reduction-percent", result.totalReduction.toFixed(2));
    setOutput("time-ms", result.totalTimeMs);
    setOutput("report-json", JSON.stringify(result));

    if (result.files.length > 0 && result.files[0]?.gzipSize) {
        const totalGzip = result.files.reduce(
            (sum, f) => sum + (f.gzipSize || 0),
            0
        );
        setOutput("gzip-size", totalGzip);
    }
}

/**
 * Exposes benchmark metrics as GitHub Actions outputs.
 *
 * @param result - The benchmark result object whose properties are published as Action outputs. When present, `recommended` is written to `benchmark-winner`, `bestCompression` to `best-compression`, and `bestSpeed` to `best-speed`. The entire `result` is written as JSON to `benchmark-json`.
 */
export function setBenchmarkOutputs(result: BenchmarkResult): void {
    if (result.recommended) {
        setOutput("benchmark-winner", result.recommended);
    }
    if (result.bestCompression) {
        setOutput("best-compression", result.bestCompression);
    }
    if (result.bestSpeed) {
        setOutput("best-speed", result.bestSpeed);
    }
    setOutput("benchmark-json", JSON.stringify(result));
}
