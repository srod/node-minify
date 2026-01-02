/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import chalk from "chalk";
import type { BenchmarkResult, CompressorMetrics } from "../types.ts";

/**
 * Format a BenchmarkResult into a colored, human-readable console report.
 *
 * @param result - The benchmark result containing per-file metrics, options, and summary
 * @returns A string containing per-file tables and a summary (best compression, fastest, recommended), formatted with colors and separators for console output
 */
export function formatConsoleOutput(result: BenchmarkResult): string {
    let output = "";

    for (const file of result.files) {
        output += `\n${chalk.cyan("🔍 Benchmarking:")} ${chalk.bold(file.file)} (${file.originalSize})\n`;
        output += `${chalk.gray("━".repeat(60))}\n\n`;

        output += formatTable(file.results, result.options);
        output += `\n${chalk.gray("━".repeat(60))}\n`;
    }

    output += `\n${chalk.yellow("🏆 Best compression:")} ${chalk.bold(result.summary.bestCompression)}\n`;
    output += `${chalk.green("⚡ Fastest:")} ${chalk.bold(result.summary.bestPerformance)}\n`;
    output += `${chalk.blue("💡 Recommended:")} ${chalk.bold(result.summary.recommended)}\n`;

    return output;
}

/**
 * Builds a console-formatted ASCII table summarizing compressor metrics.
 *
 * The table includes columns for compressor name, size, reduction percent, time,
 * and a status column. Gzip and Brotli columns are included only if any result
 * provides those sizes. For successful results the status shows `OK`; failed
 * results display the error message. When `options.verbose` is set and a result
 * contains `iterationTimes`, a secondary line lists per-iteration times.
 *
 * @param results - Array of compressor metric objects to render as rows.
 * @param options - Optional rendering options; if `options.verbose` is true,
 *   per-iteration times (when present) are appended for each successful result.
 * @returns A single string containing the formatted table ready for console output.
 */
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

    let table = `${chalk.bold(
        headers.map((h, i) => h.padEnd(colWidths[i] ?? 10)).join("")
    )}\n`;
    table += `${chalk.gray("─".repeat(totalWidth))}\n`;

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
            row.push(chalk.green("OK".padEnd(COL_STATUS)));
            table += `${row.join("")}\n`;

            if (isVerbose && r.iterationTimes) {
                table += `${chalk.gray(
                    "  └─ " +
                        r.iterationTimes
                            .map((t) => `${Math.round(t)}ms`)
                            .join(", ")
                )}\n`;
            }
        } else {
            const row = [
                chalk.red(r.compressor.padEnd(COL_COMPRESSOR)),
                chalk.red("-".padEnd(COL_SIZE)),
                chalk.red("-".padEnd(COL_REDUCTION)),
                chalk.red("-".padEnd(COL_TIME)),
            ];
            if (hasGzip) row.push(chalk.red("-".padEnd(COL_GZIP)));
            if (hasBrotli) row.push(chalk.red("-".padEnd(COL_BROTLI)));
            row.push(chalk.red((r.error ?? "Error").padEnd(COL_STATUS)));
            table += `${row.join("")}\n`;
        }
    }

    return table;
}