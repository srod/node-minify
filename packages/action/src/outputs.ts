/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { setOutput } from "@actions/core";
import type { BenchmarkResult, MinifyResult } from "./types.ts";

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
