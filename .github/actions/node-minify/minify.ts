import { appendFileSync, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { minify } from "@node-minify/core";
import {
    getFilesizeGzippedInBytes,
    resolveCompressor,
} from "@node-minify/utils";

interface ActionResult {
    originalSize: number;
    originalSizeFormatted: string;
    minifiedSize: number;
    minifiedSizeFormatted: string;
    reductionPercent: number;
    gzipSize: number | null;
    gzipSizeFormatted: string | null;
    timeMs: number;
}

/**
 * Format a byte count into a human-readable string using unit suffixes (B, kB, MB, GB).
 *
 * @param bytes - The number of bytes to format
 * @returns `'0 B'` if `bytes` is zero; otherwise a decimal number with up to two fractional digits followed by a unit (`B`, `kB`, `MB`, `GB`), e.g. `1.23 MB`
 */
function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "kB", "MB", "GB", "TB"];
    const i = Math.min(
        Math.floor(Math.log(bytes) / Math.log(k)),
        sizes.length - 1
    );
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

/**
 * Appends a GitHub Actions output line (`name=value`) to the file pointed to by `GITHUB_OUTPUT`.
 *
 * @param name - The output variable name to set
 * @param value - The output value to write
 * @throws Error if the `GITHUB_OUTPUT` environment variable is not set
 */
function setOutput(name: string, value: string | number): void {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (!outputFile) {
        throw new Error("GITHUB_OUTPUT environment variable is not set");
    }
    appendFileSync(outputFile, `${name}=${value}\n`);
}

/**
 * Get the size of a file in bytes.
 *
 * @returns The file size in bytes.
 */
async function getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath);
    return stats.size;
}

/**
 * Orchestrates minification of a file using a dynamically resolved @node-minify compressor.
 *
 * Reads configuration from environment variables (INPUT_FILE, OUTPUT_FILE, COMPRESSOR, FILE_TYPE,
 * OPTIONS, INCLUDE_GZIP, WORKSPACE_DIR/GITHUB_WORKSPACE), validates inputs, resolves and runs the
 * chosen compressor to produce the output file, measures sizes and elapsed time, optionally
 * computes gzipped size, writes results to GitHub Actions outputs, and logs a concise summary.
 *
 * On validation or runtime failure the function logs an error and exits the process with code 1.
 */
async function run(): Promise<void> {
    const inputFile = process.env.INPUT_FILE;
    const outputFile = process.env.OUTPUT_FILE;
    const compressorName = process.env.COMPRESSOR || "terser";
    const fileType = process.env.FILE_TYPE;
    const optionsJson = process.env.OPTIONS || "{}";
    const includeGzip = process.env.INCLUDE_GZIP !== "false";
    const workspaceDir =
        process.env.WORKSPACE_DIR ||
        process.env.GITHUB_WORKSPACE ||
        process.cwd();

    if (!inputFile || !outputFile) {
        console.error("::error::Input and output files are required");
        process.exit(1);
    }

    const inputPath = resolve(workspaceDir, inputFile);
    const outputPath = resolve(workspaceDir, outputFile);

    if (!existsSync(inputPath)) {
        console.error(`::error::Input file not found: ${inputPath}`);
        process.exit(1);
    }

    try {
        const originalSize = await getFileSize(inputPath);
        const { compressor, label } = await resolveCompressor(compressorName);

        let options: Record<string, unknown>;
        try {
            options = JSON.parse(optionsJson);
        } catch {
            console.error(`::error::Invalid JSON in options: ${optionsJson}`);
            process.exit(1);
        }

        console.log(`Minifying ${inputFile} with ${label}...`);

        const requiresType = ["esbuild", "yui"].includes(compressorName);
        if (requiresType && !fileType) {
            console.error(
                `::error::Compressor '${compressorName}' requires the 'type' input (js or css)`
            );
            process.exit(1);
        }

        const startTime = performance.now();

        await minify({
            compressor: compressor as Parameters<
                typeof minify
            >[0]["compressor"],
            input: inputPath,
            output: outputPath,
            ...(fileType && { type: fileType as "js" | "css" }),
            ...(Object.keys(options).length > 0 && { options }),
        });

        const endTime = performance.now();
        const timeMs = Math.round(endTime - startTime);

        const minifiedSize = await getFileSize(outputPath);
        const reductionPercent =
            originalSize > 0
                ? Number.parseFloat(
                      (
                          ((originalSize - minifiedSize) / originalSize) *
                          100
                      ).toFixed(2)
                  )
                : 0;

        let gzipSize: number | null = null;
        let gzipSizeFormatted: string | null = null;

        if (includeGzip) {
            const gzipResult = await getFilesizeGzippedInBytes(outputPath);
            const match = gzipResult.match(/([\d.]+)\s*(\w+)/);
            if (match) {
                const value = Number.parseFloat(match[1]);
                const unit = match[2];
                const multipliers: Record<string, number> = {
                    B: 1,
                    kB: 1024,
                    MB: 1024 * 1024,
                    GB: 1024 * 1024 * 1024,
                };
                gzipSize = Math.round(value * (multipliers[unit] || 1));
                gzipSizeFormatted = gzipResult;
            }
        }

        const result: ActionResult = {
            originalSize,
            originalSizeFormatted: formatBytes(originalSize),
            minifiedSize,
            minifiedSizeFormatted: formatBytes(minifiedSize),
            reductionPercent,
            gzipSize,
            gzipSizeFormatted,
            timeMs,
        };

        setOutput("original-size", result.originalSize);
        setOutput("original-size-formatted", result.originalSizeFormatted);
        setOutput("minified-size", result.minifiedSize);
        setOutput("minified-size-formatted", result.minifiedSizeFormatted);
        setOutput("reduction-percent", result.reductionPercent);
        setOutput("gzip-size", result.gzipSize ?? "");
        setOutput("gzip-size-formatted", result.gzipSizeFormatted ?? "N/A");
        setOutput("time-ms", result.timeMs);

        console.log(`✅ Minification complete!`);
        console.log(`   Original: ${result.originalSizeFormatted}`);
        console.log(`   Minified: ${result.minifiedSizeFormatted}`);
        console.log(`   Reduction: ${result.reductionPercent}%`);
        if (gzipSizeFormatted) {
            console.log(`   Gzip: ${gzipSizeFormatted}`);
        }
        console.log(`   Time: ${result.timeMs}ms`);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown error";
        console.error(`::error::Minification failed: ${message}`);
        process.exit(1);
    }
}

run().catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`::error::Minification failed: ${message}`);
    process.exit(1);
});
