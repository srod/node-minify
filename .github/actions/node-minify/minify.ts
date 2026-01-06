import { appendFileSync, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { minify } from "@node-minify/core";
import { getFilesizeGzippedInBytes } from "@node-minify/utils";

const KNOWN_COMPRESSOR_EXPORTS: Record<string, string> = {
    esbuild: "esbuild",
    "google-closure-compiler": "gcc",
    gcc: "gcc",
    oxc: "oxc",
    swc: "swc",
    terser: "terser",
    "uglify-js": "uglifyJs",
    "babel-minify": "babelMinify",
    "uglify-es": "uglifyEs",
    yui: "yui",
    "clean-css": "cleanCss",
    cssnano: "cssnano",
    csso: "csso",
    lightningcss: "lightningCss",
    crass: "crass",
    sqwish: "sqwish",
    "html-minifier": "htmlMinifier",
    jsonminify: "jsonMinify",
    imagemin: "imagemin",
    sharp: "sharp",
    svgo: "svgo",
    "no-compress": "noCompress",
};

async function resolveCompressor(
    name: string
): Promise<{ compressor: unknown; label: string }> {
    const packageName = `@node-minify/${name}`;
    const mod = (await import(packageName)) as Record<string, unknown>;

    const knownExport = KNOWN_COMPRESSOR_EXPORTS[name];
    if (knownExport && typeof mod[knownExport] === "function") {
        return { compressor: mod[knownExport], label: name };
    }

    if (typeof mod.default === "function") {
        return { compressor: mod.default, label: name };
    }

    for (const value of Object.values(mod)) {
        if (typeof value === "function") {
            return { compressor: value, label: name };
        }
    }

    throw new Error(
        `Package '${packageName}' doesn't export a valid compressor function.`
    );
}

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

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "kB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

function setOutput(name: string, value: string | number): void {
    const outputFile = process.env.GITHUB_OUTPUT;
    if (!outputFile) {
        throw new Error("GITHUB_OUTPUT environment variable is not set");
    }
    appendFileSync(outputFile, `${name}=${value}\n`);
}

async function getFileSize(filePath: string): Promise<number> {
    const stats = await stat(filePath);
    return stats.size;
}

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
