/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

export interface ActionInputs {
    /**
     * Input file(s) to minify (glob pattern or path).
     * Optional when `auto` is true.
     */
    input?: string;
    /**
     * Output file path.
     * Optional when `auto` is true.
     */
    output?: string;
    compressor: string;
    /**
     * File type hint for compressors that handle multiple types.
     * Only required for `esbuild` (supports both JS and CSS) and deprecated `yui`.
     * Other compressors auto-detect or only support one type.
     */
    type?: "js" | "css";
    options: Record<string, unknown>;
    reportSummary: boolean;
    reportPRComment: boolean;
    reportAnnotations: boolean;
    benchmark: boolean;
    benchmarkCompressors: string[];
    failOnIncrease: boolean;
    minReduction: number;
    includeGzip: boolean;
    workingDirectory: string;
    githubToken?: string;
    /**
     * Enable zero-config auto mode.
     * When true, automatically discovers and processes files based on patterns.
     */
    auto: boolean;
    /**
     * Custom glob patterns for auto mode (e.g., ["src/**\/*.js", "lib/**\/*.ts"]).
     * Only used when `auto` is true.
     */
    patterns?: string[];
    /**
     * Output directory for auto mode.
     * Defaults to "dist".
     */
    outputDir: string;
    /**
     * Additional ignore patterns for auto mode (e.g., ["**\/*.test.js", "**\/*.spec.ts"]).
     * Only used when `auto` is true.
     */
    additionalIgnore?: string[];
    /**
     * Preview mode - show what would be processed without actually minifying.
     */
    dryRun: boolean;
}

export interface FileResult {
    file: string;
    originalSize: number;
    minifiedSize: number;
    reduction: number;
    gzipSize?: number;
    brotliSize?: number;
    timeMs: number;
}

export interface MinifyResult {
    files: FileResult[];
    compressor: string;
    totalOriginalSize: number;
    totalMinifiedSize: number;
    totalReduction: number;
    totalTimeMs: number;
}

export interface BenchmarkCompressorResult {
    compressor: string;
    success: boolean;
    size?: number;
    reduction?: number;
    gzipSize?: number;
    timeMs?: number;
    error?: string;
}

export interface BenchmarkResult {
    file: string;
    originalSize: number;
    compressors: BenchmarkCompressorResult[];
    bestCompression?: string;
    bestSpeed?: string;
    recommended?: string;
}

export interface ComparisonResult {
    file: string;
    baseSize: number | null;
    currentSize: number;
    change: number | null;
    isNew: boolean;
}
