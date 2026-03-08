/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { summary } from "@actions/core";
import { prettyBytes } from "@node-minify/utils";
import { detectFileType, type FileType } from "../autoDetect.ts";
import type {
    ActionInputs,
    BenchmarkResult,
    FileResult,
    MinifyResult,
} from "../types.ts";

/**
 * Maps file types to their corresponding emojis for visual identification in the summary.
 */
const TYPE_EMOJI: Record<FileType, string> = {
    js: "📜",
    css: "🎨",
    html: "🌐",
    json: "📋",
    svg: "🖼️",
    unknown: "❓",
};

/**
 * Maps file types to their human-readable labels for group headings.
 */
const TYPE_LABEL: Record<FileType, string> = {
    js: "JavaScript",
    css: "CSS",
    html: "HTML",
    json: "JSON",
    svg: "SVG",
    unknown: "Unknown",
};

/**
 * Returns the emoji corresponding to a given file type.
 *
 * @param type - The file type to get an emoji for
 * @returns An emoji string or a default question mark
 */
function getTypeEmoji(type: FileType): string {
    return TYPE_EMOJI[type] ?? "❓";
}

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
        { data: f.gzipSize != null ? prettyBytes(f.gzipSize) : "-" },
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
 * Generate a GitHub Actions summary for auto mode results, grouped by file type.
 *
 * Creates separate tables for each file type (JS, CSS, HTML, etc.), including
 * original/minified sizes and reduction percentages, and appends a grand total.
 *
 * @param results - Array of minification results to aggregate and display
 * @param inputs - Action inputs containing configuration such as includeGzip
 */
export async function generateAutoModeSummary(
    results: MinifyResult[],
    inputs: ActionInputs
): Promise<void> {
    if (results.length === 0) {
        await summary.addRaw("No files were processed.").write();
        return;
    }

    const allFiles = results.flatMap((r) => r.files);
    const groups: Record<FileType, FileResult[]> = {
        js: [],
        css: [],
        html: [],
        json: [],
        svg: [],
        unknown: [],
    };

    for (const file of allFiles) {
        groups[detectFileType(file.file)].push(file);
    }

    let totalOriginal = 0;
    let totalMinified = 0;

    summary.addHeading("📦 node-minify Auto Mode Results", 2);

    for (const type of Object.keys(groups) as FileType[]) {
        const files = groups[type];
        if (files.length === 0) continue;

        const emoji = getTypeEmoji(type);
        const label = TYPE_LABEL[type];
        summary.addHeading(`${emoji} ${label}`, 3);

        const rows = files.map((f) => {
            totalOriginal += f.originalSize;
            totalMinified += f.minifiedSize;

            const row = [
                { data: `\`${f.file}\`` },
                { data: prettyBytes(f.originalSize) },
                { data: prettyBytes(f.minifiedSize) },
                { data: `${f.reduction.toFixed(1)}%` },
            ];

            if (inputs.includeGzip) {
                row.push({
                    data: f.gzipSize != null ? prettyBytes(f.gzipSize) : "-",
                });
            }

            row.push({ data: `${f.timeMs}ms` });

            return row;
        });

        const headers = [
            { data: "File", header: true },
            { data: "Original", header: true },
            { data: "Minified", header: true },
            { data: "Reduction", header: true },
        ];

        if (inputs.includeGzip) {
            headers.push({ data: "Gzip", header: true });
        }

        headers.push({ data: "Time", header: true });

        summary.addTable([headers, ...rows]);
    }

    const totalReduction =
        totalOriginal > 0
            ? ((totalOriginal - totalMinified) / totalOriginal) * 100
            : 0;

    await summary
        .addBreak()
        .addRaw(
            `**Total:** ${prettyBytes(totalOriginal)} → ${prettyBytes(totalMinified)} (${totalReduction.toFixed(1)}% reduction)`
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
