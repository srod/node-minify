/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { BenchmarkResult } from "../types.ts";

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
                output += `| ${r.compressor} | - | - | - |`;
                if (hasGzip) output += " - |";
                if (hasBrotli) output += " - |";
                output += ` ERROR: ${r.error} |\n`;
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
