/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { join, parse } from "node:path";
import type {
    CompressorOptions,
    CompressorResult,
    MinifierOptions,
    Settings,
} from "@node-minify/types";
import { ValidationError } from "./error.ts";
import { writeFileAsync } from "./writeFile.ts";

/**
 * Execute the configured compressor and persist its outputs according to the provided settings.
 *
 * @param settings - Compressor settings including output targets, options, and the `compressor` implementation
 * @param content - The input content to be compressed
 * @param index - Optional index used when processing multiple inputs
 * @returns The minified code produced by the compressor
 * @throws ValidationError If `settings` is missing, `settings.compressor` is not provided, or the compressor returns an invalid result
 */
export async function run<T extends CompressorOptions = CompressorOptions>({
    settings,
    content,
    index,
}: MinifierOptions<T>): Promise<string> {
    if (!settings) {
        throw new ValidationError("Settings must be provided");
    }

    if (!settings.compressor) {
        throw new ValidationError("Compressor must be provided in settings");
    }

    const result = await settings.compressor({
        settings,
        content,
        index,
    });

    validateCompressorResult(result, settings);

    await writeOutput(result, settings, index);

    return result.code;
}

/**
 * Verify that a compressor result is an object containing a string `code` property and narrow its type to `CompressorResult`.
 *
 * @param result - The value returned by the compressor to validate.
 * @param settings - Minifier settings (used to derive the compressor label for error messages).
 * @throws ValidationError - If `result` is not an object with a string `code` property.
 */
function validateCompressorResult<
    T extends CompressorOptions = CompressorOptions,
>(result: unknown, settings: Settings<T>): asserts result is CompressorResult {
    if (!result || typeof result !== "object") {
        const label = settings.compressorLabel || "compressor";
        throw new ValidationError(
            `Compressor '${label}' returned invalid result. Expected an object with { code: string }.`
        );
    }

    const obj = result as Record<string, unknown>;
    if (!("code" in obj) || typeof obj.code !== "string") {
        const label = settings.compressorLabel || "compressor";
        throw new ValidationError(
            `Compressor '${label}' must return { code: string }. Got: ${JSON.stringify(Object.keys(obj))}`
        );
    }
}

/**
 * Write compressor result outputs to disk unless the operation is in-memory.
 *
 * Writes multiple output files when `result.outputs` is provided, writes a binary `result.buffer` to the configured output when present, otherwise writes `result.code`. If a source map is available and a source map URL can be resolved from `settings`, the map is written alongside the main output.
 *
 * @param result - The compressor result containing `code`, optional `buffer`, `map`, or `outputs` describing one or more outputs
 * @param settings - Settings that include output destination(s) and optional in-memory `content` which disables disk writes
 * @param index - Optional index used when writing to multiple targets or when tracking a particular input within a batch
 */
async function writeOutput<T extends CompressorOptions = CompressorOptions>(
    result: CompressorResult,
    settings: Settings<T>,
    index?: number
): Promise<void> {
    const isInMemoryMode = Boolean(settings.content);
    if (isInMemoryMode || !settings.output) {
        return;
    }

    // Handle multi-output (for image conversion to multiple formats)
    if (result.outputs && result.outputs.length > 0) {
        await writeMultipleOutputs(result.outputs, settings, index);
        return;
    }

    // Handle single buffer output (for binary images)
    if (result.buffer) {
        await writeFileAsync({
            file: settings.output,
            content: result.buffer,
            index,
        });
        return;
    }

    // Default: write code (string) output
    await writeFileAsync({
        file: settings.output,
        content: result.code,
        index,
    });

    if (result.map) {
        const sourceMapUrl = getSourceMapUrl(settings);
        if (sourceMapUrl) {
            await writeFileAsync({
                file: sourceMapUrl,
                content: result.map,
                index,
            });
        }
    }
}

/**
 * Extract the first input file path from the input configuration.
 *
 * @param input - A single file path, an array of paths, or undefined
 * @returns The first input file path, or an empty string if none available
 */
function getFirstInputFile(input: string | string[] | undefined): string {
    if (typeof input === "string") {
        return input;
    }
    if (Array.isArray(input) && input.length > 0) {
        return input[0] ?? "";
    }
    return "";
}

/**
 * Write compressor outputs to files resolved from the provided settings.
 *
 * Resolves a target path for each output entry based on settings.output and settings.input, then writes each entry's content to its resolved file location.
 *
 * @param outputs - Array of compressor output entries (each entry typically contains `content` and optional `format`) to be written.
 * @param settings - Settings used to resolve target paths (may supply `output` pattern/array and `input` for deriving names).
 * @param index - Optional numeric index forwarded to the file writer for each write operation.
 */
async function writeMultipleOutputs<
    T extends CompressorOptions = CompressorOptions,
>(
    outputs: NonNullable<CompressorResult["outputs"]>,
    settings: Settings<T>,
    index?: number
): Promise<void> {
    const output = settings.output;
    const isArrayOutput = Array.isArray(output);
    const outputsArray = isArrayOutput ? output : [output];
    const inputFile = getFirstInputFile(settings.input);
    const inputDir = parse(inputFile).dir;
    const inputBase = parse(inputFile).name;

    for (let i = 0; i < outputs.length; i++) {
        const outputResult = outputs[i];
        if (!outputResult) {
            continue;
        }

        const format = outputResult.format || "out";
        let targetFile: string;

        const arrayItem = outputsArray[i];

        if (
            isArrayOutput &&
            arrayItem !== undefined &&
            arrayItem !== "$1" &&
            arrayItem.trim() !== ""
        ) {
            // Explicit output path provided in array - use as-is
            targetFile = arrayItem;
        } else if (typeof output === "string" && output === "$1") {
            // $1 only: auto-generate from input filename in input directory
            const baseName = inputBase || "output";
            targetFile = inputDir
                ? join(inputDir, `${baseName}.${format}`)
                : `${baseName}.${format}`;
        } else if (typeof output === "string" && output.includes("$1")) {
            // $1 pattern in path: replace and append format
            const extensionlessName = inputBase || "output";
            const outputFile = output.replace(/\$1/g, extensionlessName);
            targetFile = `${outputFile}.${format}`;
        } else if (typeof output === "string") {
            // Single string output: append format extension
            targetFile = `${output}.${format}`;
        } else {
            // Fallback
            const baseName = inputBase || "output";
            targetFile = inputDir
                ? join(inputDir, `${baseName}.${format}`)
                : `${baseName}.${format}`;
        }

        await writeFileAsync({
            file: targetFile,
            content: outputResult.content,
            index,
        });
    }
}

/**
 * Resolve the configured source map path or URL from the provided settings.
 *
 * @param settings - Minifier settings that may include `options.sourceMap` or `options._sourceMap`
 * @returns The source map URL or filename when configured, `undefined` otherwise.
 */
function getSourceMapUrl<T extends CompressorOptions = CompressorOptions>(
    settings: Settings<T>
): string | undefined {
    const options = settings.options as Record<string, unknown> | undefined;
    if (!options) {
        return undefined;
    }

    const sourceMap = options.sourceMap as Record<string, unknown> | undefined;
    if (sourceMap) {
        if (typeof sourceMap.url === "string") {
            return sourceMap.url;
        }
        if (typeof sourceMap.filename === "string") {
            return sourceMap.filename;
        }
    }

    const _sourceMap = options._sourceMap as
        | Record<string, unknown>
        | undefined;
    if (_sourceMap && typeof _sourceMap.url === "string") {
        return _sourceMap.url;
    }

    return undefined;
}