/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

export interface BenchmarkOptions {
    input: string | string[];
    compressors?: string[];
    iterations?: number;
    warmup?: number;
    includeGzip?: boolean;
    includeBrotli?: boolean;
    format?: "console" | "json" | "markdown";
    output?: string;
    verbose?: boolean;
    type?: "js" | "css" | "html";
    compressorOptions?: Record<string, unknown>;
}

export interface CompressorMetrics {
    compressor: string;
    sizeBytes: number;
    size: string;
    timeMs: number;
    timeMinMs?: number;
    timeMaxMs?: number;
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
