/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { BenchmarkResult } from "../types.ts";

/**
 * Render a BenchmarkResult as a Markdown-formatted report.
 *
 * The output includes a top-level header with the result timestamp, a per-file section
 * for each input file containing a dynamic table (always: Compressor, Size, Reduction, Time;
 * optionally: Gzip and/or Brotli if present), and a final "Summary" section with
 * best compression, fastest, and recommended entries.
 *
 * For successful measurements each table row contains compressor, size, reduction (one decimal),
 * rounded time (ms), optional gzip/brotli column values (or `-` when absent), and `OK` in the Status column.
 * For failed measurements the row shows `-` placeholders for numeric columns and a Status value of
 * `ERROR: <message>` where any pipe characters in the message are escaped.
 *
 * @param result - The benchmark result object to format into Markdown.
 * @returns The complete Markdown report as a string.
 */
export function formatMarkdownOutput(result: BenchmarkResult): string {
    let output = "# Benchmark Results\n\n";
    output += `**Generated:** ${result.timestamp}\n\n`;

    for (const file of result.files) {
        const hasGzip = file.results.some((r) => r.gzipSize);
        const hasBrotli = file.results.some((r) => r.brotliSize);

        output += `## ${file.file} (${file.originalSize})\n\n`;

        let headers = "| Compressor | Size | Reduction | Time |";
        let separator = "|------------|------|-----------|------|";
        if (hasGzip) {
            headers += " Gzip |";
            separator += "------|";
        }
        if (hasBrotli) {
            headers += " Brotli |";
            separator += "--------|";
        }
        headers += " Status |\n";
        separator += "--------|\n";

        output += headers;
        output += separator;

        for (const r of file.results) {
            if (r.success) {
                output += `| ${r.compressor} | ${r.size} | ${r.reductionPercent.toFixed(1)}% | ${Math.round(r.timeMs)}ms |`;
                if (hasGzip) output += ` ${r.gzipSize ?? "-"} |`;
                if (hasBrotli) output += ` ${r.brotliSize ?? "-"} |`;
                output += " OK |\n";
            } else {
                const safeError = (r.error ?? "-").replace(/\|/g, "\\|");
                output += `| ${r.compressor} | - | - | - |`;
                if (hasGzip) output += " - |";
                if (hasBrotli) output += " - |";
                output += ` ERROR: ${safeError} |\n`;
            }
        }
        output += "\n";
    }

    output += "### Summary\n\n";
    output += `- 🏆 **Best compression:** ${result.summary.bestCompression}\n`;
    output += `- ⚡ **Fastest:** ${result.summary.bestPerformance}\n`;
    output += `- 💡 **Recommended:** ${result.summary.recommended}\n`;

    return output;
}