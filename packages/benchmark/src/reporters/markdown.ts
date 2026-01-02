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
        output += `## ${file.file} (${file.originalSize})\n\n`;
        output += "| Compressor | Size | Reduction | Time | Status |\n";
        output += "|------------|------|-----------|------|--------|\n";

        for (const r of file.results) {
            if (r.success) {
                output += `| ${r.compressor} | ${r.size} | ${r.reductionPercent.toFixed(1)}% | ${Math.round(r.timeMs)}ms | OK |\n`;
            } else {
                output += `| ${r.compressor} | - | - | - | ERROR: ${r.error} |\n`;
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
