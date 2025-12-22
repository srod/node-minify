/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, Settings } from "@node-minify/types";
import { ValidationError } from "./error.ts";
import { writeFile } from "./writeFile.ts";

interface RunParameters {
    settings: Settings;
    content?: string;
    index?: number;
}

export async function run({
    settings,
    content,
    index,
}: RunParameters): Promise<string> {
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

    writeOutput(result, settings, index);

    return result.code;
}

function writeOutput(
    result: CompressorResult,
    settings: Settings,
    index?: number
): void {
    const isInMemoryMode = Boolean(settings.content);
    if (isInMemoryMode || !settings.output) {
        return;
    }

    writeFile({ file: settings.output, content: result.code, index });

    if (result.map) {
        const sourceMapUrl = getSourceMapUrl(settings);
        if (sourceMapUrl) {
            writeFile({ file: sourceMapUrl, content: result.map, index });
        }
    }
}

function getSourceMapUrl(settings: Settings): string | undefined {
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
