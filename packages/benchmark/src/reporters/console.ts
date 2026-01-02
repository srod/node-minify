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

        output += formatTable(file.results);
        output += `\n${chalk.gray("━".repeat(60))}\n`;
    }

    output += `\n${chalk.yellow("🏆 Best compression:")} ${chalk.bold(result.summary.bestCompression)}\n`;
    output += `${chalk.green("⚡ Fastest:")} ${chalk.bold(result.summary.bestPerformance)}\n`;
    output += `${chalk.blue("💡 Recommended:")} ${chalk.bold(result.summary.recommended)}\n`;

    return output;
}

function formatTable(results: CompressorMetrics[]): string {
    const headers = ["Compressor", "Size", "Reduction", "Time", "Status"];
    const COL_COMPRESSOR = 16;
    const COL_SIZE = 10;
    const COL_REDUCTION = 12;
    const COL_TIME = 10;
    const COL_STATUS = 10;
    const colWidths = [
        COL_COMPRESSOR,
        COL_SIZE,
        COL_REDUCTION,
        COL_TIME,
        COL_STATUS,
    ];
    const totalWidth =
        COL_COMPRESSOR + COL_SIZE + COL_REDUCTION + COL_TIME + COL_STATUS;

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
                chalk.green("OK").padEnd(COL_STATUS),
            ];
            table += `${row.join("")}\n`;
        } else {
            table += `${chalk.red(r.compressor.padEnd(COL_COMPRESSOR))} ${chalk.red(`ERROR: ${r.error}`)}\n`;
        }
    }

    return table;
}
