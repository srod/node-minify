/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { dirname, isAbsolute, join, parse } from "node:path";
import type {
    CompressorOptions,
    CompressorResult,
    MinifierOptions,
    Settings,
} from "@node-minify/types";
import { ValidationError } from "./error.ts";
import { writeFileAsync } from "./writeFile.ts";

/**
 * Run the configured compressor and persist its outputs according to the provided settings.
 *
 * @param settings - Compressor settings including output targets and the `compressor` implementation
 * @param content - The input content to be compressed
 * @param index - Optional index used when processing multiple inputs
 * @returns The minified code produced by the compressor
 * @throws {ValidationError} If `settings` is missing or `settings.compressor` is not provided
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

    await writeOutput(result, settings, index);

    return result.code;
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
        let sourceMapUrl = getSourceMapUrl(settings);
        if (sourceMapUrl) {
            const output =
                index !== undefined && Array.isArray(settings.output)
                    ? settings.output[index]
                    : settings.output;
            if (
                output &&
                typeof output === "string" &&
                !isAbsolute(sourceMapUrl)
            ) {
                sourceMapUrl = join(dirname(output), sourceMapUrl);
            }
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
 * Write multiple output files produced by a compressor according to the settings' output configuration.
 *
 * This writes each provided output entry to a computed target path:
 * - If `settings.output` is an array, a non-empty array item (not "$1") at the same index is used verbatim as the target path.
 * - If `settings.output` is the string "$1", the target is generated from the first input filename and the output's `format` (or "out" if missing).
 * - If `settings.output` contains "$1", every "$1" is replaced with the input base name and the output's `format` is appended.
 * - If `settings.output` is a plain string, that string is used with the output's `format` appended.
 * - If no usable output pattern is provided, a default path is generated from the input filename and the output's `format`.
 *
 * Each output's `content` is written to its resolved path using `writeFile`. The first input (if any) is used to derive base names and directories for auto-generated targets.
 *
 * @param outputs - Array of compressor outputs (each may include `content` and optional `format`) to write.
 * @param settings - Settings used to resolve output targets (may supply `output` and `input`).
 * @param index - Optional index forwarded to the file writer when writing each output.
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

    const tasks = outputs.map((outputResult, i) => {
        if (!outputResult) {
            return Promise.resolve();
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

        return writeFileAsync({
            file: targetFile,
            content: outputResult.content,
            index,
        });
    });

    await Promise.all(tasks);
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
