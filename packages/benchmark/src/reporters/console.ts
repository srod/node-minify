/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { styleText } from "node:util";
import type { BenchmarkResult, CompressorMetrics } from "../types.ts";

export function formatConsoleOutput(result: BenchmarkResult): string {
    let output = "";

    for (const file of result.files) {
        output += `\n${styleText("cyan", "🔍 Benchmarking:")} ${styleText("bold", file.file)} (${file.originalSize})\n`;
        output += `${styleText("gray", "━".repeat(60))}\n\n`;

        output += formatTable(file.results, result.options);
        output += `\n${styleText("gray", "━".repeat(60))}\n`;
    }

    output += `\n${styleText("yellow", "🏆 Best compression:")} ${styleText("bold", result.summary.bestCompression)}\n`;
    output += `${styleText("green", "⚡ Fastest:")} ${styleText("bold", result.summary.bestPerformance)}\n`;
    output += `${styleText("blue", "💡 Recommended:")} ${styleText("bold", result.summary.recommended)}\n`;

    return output;
}

function formatTable(
    results: CompressorMetrics[],
    options?: Partial<BenchmarkResult["options"]>
): string {
    const hasGzip = results.some((r) => r.gzipSize);
    const hasBrotli = results.some((r) => r.brotliSize);
    const isVerbose = options?.verbose;

    const headers = ["Compressor", "Size", "Reduction", "Time"];
    if (hasGzip) headers.push("Gzip");
    if (hasBrotli) headers.push("Brotli");
    headers.push("Status");

    const COL_COMPRESSOR = 16;
    const COL_SIZE = 10;
    const COL_REDUCTION = 12;
    const COL_TIME = 10;
    const COL_GZIP = 10;
    const COL_BROTLI = 10;
    const COL_STATUS = 10;

    const colWidths: number[] = [
        COL_COMPRESSOR,
        COL_SIZE,
        COL_REDUCTION,
        COL_TIME,
    ];
    if (hasGzip) colWidths.push(COL_GZIP);
    if (hasBrotli) colWidths.push(COL_BROTLI);
    colWidths.push(COL_STATUS);

    const totalWidth = colWidths.reduce((a, b) => a + b, 0);

    let table = `${styleText(
        "bold",
        headers.map((h, i) => h.padEnd(colWidths[i] ?? 10)).join("")
    )}\n`;
    table += `${styleText("gray", "─".repeat(totalWidth))}\n`;

    for (const r of results) {
        if (r.success) {
            const row = [
                r.compressor.padEnd(COL_COMPRESSOR),
                r.size.padEnd(COL_SIZE),
                `${r.reductionPercent.toFixed(1)}%`.padEnd(COL_REDUCTION),
                `${Math.round(r.timeMs)}ms`.padEnd(COL_TIME),
            ];
            if (hasGzip) row.push((r.gzipSize ?? "-").padEnd(COL_GZIP));
            if (hasBrotli) row.push((r.brotliSize ?? "-").padEnd(COL_BROTLI));
            row.push(styleText("green", "OK".padEnd(COL_STATUS)));
            table += `${row.join("")}\n`;

            if (isVerbose && r.iterationTimes) {
                table += `${styleText(
                    "gray",
                    "  └─ " +
                        r.iterationTimes
                            .map((t) => `${Math.round(t)}ms`)
                            .join(", ")
                )}\n`;
            }
        } else {
            const row = [
                styleText("red", r.compressor.padEnd(COL_COMPRESSOR)),
                styleText("red", "-".padEnd(COL_SIZE)),
                styleText("red", "-".padEnd(COL_REDUCTION)),
                styleText("red", "-".padEnd(COL_TIME)),
            ];
            if (hasGzip) row.push(styleText("red", "-".padEnd(COL_GZIP)));
            if (hasBrotli) row.push(styleText("red", "-".padEnd(COL_BROTLI)));
            row.push(
                styleText("red", (r.error ?? "Error").padEnd(COL_STATUS))
            );
            table += `${row.join("")}\n`;
        }
    }

    return table;
}
