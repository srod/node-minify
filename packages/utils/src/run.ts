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
import { writeFile } from "./writeFile.ts";

/**
 * Execute the compressor and write output.
 * @param params - Run parameters containing settings, content, and index
 * @returns Minified content string
 * @throws {ValidationError} If settings or compressor is missing
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

    writeOutput(result, settings as unknown as Settings, index);

    return result.code;
}

function writeOutput<T extends CompressorOptions = CompressorOptions>(
    result: CompressorResult,
    settings: Settings<T>,
    index?: number
): void {
    const isInMemoryMode = Boolean(settings.content);
    if (isInMemoryMode || !settings.output) {
        return;
    }

    // Handle multi-output (for image conversion to multiple formats)
    if (result.outputs && result.outputs.length > 0) {
        writeMultipleOutputs(result.outputs, settings, index);
        return;
    }

    // Handle single buffer output (for binary images)
    if (result.buffer) {
        writeFile({ file: settings.output, content: result.buffer, index });
        return;
    }

    // Default: write code (string) output
    writeFile({ file: settings.output, content: result.code, index });

    if (result.map) {
        const sourceMapUrl = getSourceMapUrl(settings);
        if (sourceMapUrl) {
            writeFile({ file: sourceMapUrl, content: result.map, index });
        }
    }
}

/**
 * Write multiple output files for multi-format image conversion.
 */
function writeMultipleOutputs<T extends CompressorOptions = CompressorOptions>(
    outputs: NonNullable<CompressorResult["outputs"]>,
    settings: Settings<T>,
    index?: number
): void {
    const output = settings.output;
    const isArrayOutput = Array.isArray(output);
    const outputsArray = isArrayOutput ? output : [output];
    // Use the first input file to derive the base name and directory for auto-generated output paths
    const inputFile =
        typeof settings.input === "string"
            ? settings.input
            : Array.isArray(settings.input) && settings.input.length > 0
              ? (settings.input[0] ?? "")
              : "";
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

        writeFile({ file: targetFile, content: outputResult.content, index });
    }
}

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
