/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { summary } from "@actions/core";
import { prettyBytes } from "@node-minify/utils";
import type { BenchmarkResult, MinifyResult } from "../types.ts";

/**
 * Generate a GitHub Actions summary reporting per-file minification metrics and totals.
 *
 * Builds a Markdown table with columns File, Original, Minified, Reduction, Gzip, and Time,
 * includes the compressor name, and appends a total line showing aggregated original/minified sizes and overall reduction.
 *
 * @param result - Minification results containing per-file metrics and aggregate totals used to populate the summary
 */
export async function generateSummary(result: MinifyResult): Promise<void> {
    const rows = result.files.map((f) => [
        { data: `\`${f.file}\`` },
        { data: prettyBytes(f.originalSize) },
        { data: prettyBytes(f.minifiedSize) },
        { data: `${f.reduction.toFixed(1)}%` },
        { data: f.gzipSize ? prettyBytes(f.gzipSize) : "-" },
        { data: `${f.timeMs}ms` },
    ]);

    await summary
        .addHeading("📦 node-minify Results", 2)
        .addTable([
            [
                { data: "File", header: true },
                { data: "Original", header: true },
                { data: "Minified", header: true },
                { data: "Reduction", header: true },
                { data: "Gzip", header: true },
                { data: "Time", header: true },
            ],
            ...rows,
        ])
        .addBreak()
        .addRaw(`**Compressor:** ${result.compressor}`)
        .addBreak()
        .addRaw(
            `**Total:** ${prettyBytes(result.totalOriginalSize)} → ${prettyBytes(result.totalMinifiedSize)} (${result.totalReduction.toFixed(1)}% reduction)`
        )
        .write();
}

/**
 * Generate a Markdown benchmark summary comparing compressors and write it to the GitHub Actions summary.
 *
 * Builds a table of compressors showing status, size, reduction, gzip size, and time; marks recommended, best-speed, and best-compression entries with badges; and includes the source file and recommended compressor in the summary.
 *
 * @param result - BenchmarkResult containing the file path, originalSize, a list of compressors with their metrics or errors, and optional recommended/best markers used to annotate the table
 */
export async function generateBenchmarkSummary(
    result: BenchmarkResult
): Promise<void> {
    const rows = result.compressors.map((c) => {
        if (!c.success) {
            return [
                { data: c.compressor },
                { data: "❌ Failed" },
                { data: "-" },
                { data: "-" },
                { data: c.error || "Unknown error" },
            ];
        }
        const isRecommended = c.compressor === result.recommended;
        const isBestSpeed = c.compressor === result.bestSpeed;
        const isBestCompression = c.compressor === result.bestCompression;

        let badge = "";
        if (isRecommended) badge = " 🏆";
        else if (isBestSpeed) badge = " ⚡";
        else if (isBestCompression) badge = " 📦";

        return [
            { data: `${c.compressor}${badge}` },
            { data: c.size != null ? prettyBytes(c.size) : "-" },
            { data: c.reduction != null ? `${c.reduction.toFixed(1)}%` : "-" },
            { data: c.gzipSize != null ? prettyBytes(c.gzipSize) : "-" },
            { data: c.timeMs != null ? `${c.timeMs}ms` : "-" },
        ];
    });

    await summary
        .addHeading("🏁 Benchmark Results", 2)
        .addRaw(
            `**File:** \`${result.file}\` (${prettyBytes(result.originalSize)})`
        )
        .addBreak()
        .addTable([
            [
                { data: "Compressor", header: true },
                { data: "Size", header: true },
                { data: "Reduction", header: true },
                { data: "Gzip", header: true },
                { data: "Time", header: true },
            ],
            ...rows,
        ])
        .addBreak()
        .addRaw(`**Recommended:** ${result.recommended || "N/A"}`)
        .write();
}