/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { summary } from "@actions/core";
import { prettyBytes } from "@node-minify/utils";
import type { BenchmarkResult, MinifyResult } from "../types.ts";

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
            { data: c.size ? prettyBytes(c.size) : "-" },
            { data: c.reduction ? `${c.reduction.toFixed(1)}%` : "-" },
            { data: c.gzipSize ? prettyBytes(c.gzipSize) : "-" },
            { data: c.timeMs ? `${c.timeMs}ms` : "-" },
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
