/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

export interface BenchmarkOptions {
    input: string | string[];
    compressors?: string[];
    iterations?: number;
    warmup?: number;
    includeGzip?: boolean;
    includeBrotli?: boolean;
    /**
     * Report format used when writing to `output` (defaults to `"console"`).
     */
    format?: "console" | "json" | "markdown";
    /**
     * File path to write the formatted benchmark report to.
     * Parent directories are created automatically; console format is written
     * without terminal color codes.
     */
    output?: string;
    verbose?: boolean;
    type?: "js" | "css" | "html";
    compressorOptions?: Record<string, unknown>;
    onProgress?: (compressor: string, file: string) => void;
}

export interface CompressorMetrics {
    compressor: string;
    sizeBytes: number;
    size: string;
    timeMs: number;
    timeMinMs?: number;
    timeMaxMs?: number;
    iterationTimes?: number[];
    reductionPercent: number;
    gzipBytes?: number;
    gzipSize?: string;
    brotliBytes?: number;
    brotliSize?: string;
    error?: string;
    success: boolean;
}

export interface FileResult {
    file: string;
    originalSizeBytes: number;
    originalSize: string;
    results: CompressorMetrics[];
}

export interface BenchmarkResult {
    timestamp: string;
    options: Partial<BenchmarkOptions>;
    files: FileResult[];
    summary: {
        bestCompression: string;
        bestPerformance: string;
        recommended: string;
    };
}
