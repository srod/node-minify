/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import chalk from "chalk";
import type { BenchmarkResult, CompressorMetrics } from "../types.ts";

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
            row.push(chalk.green("OK").padEnd(COL_STATUS));
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
            table += `${chalk.red(r.compressor.padEnd(COL_COMPRESSOR))} ${chalk.red(`ERROR: ${r.error}`)}\n`;
        }
    }

    return table;
}
