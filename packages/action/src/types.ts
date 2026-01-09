/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

export interface ActionInputs {
    input: string;
    output: string;
    compressor: string;
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
