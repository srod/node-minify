/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorReturnType, Settings } from "@node-minify/types";
import { getContentFromFiles } from "./getContentFromFiles.ts";
import { run } from "./run.ts";

/**
 * Compress a single file.
 * @param settings Settings
 */
export function compressSingleFile(settings: Settings): CompressorReturnType {
    const content = determineContent(settings);
    return run({ settings, content });
}

/**
 * Determine the content to minify.
 * @param settings
 * @returns
 */
function determineContent(settings: Settings): string {
    if (settings.content) {
        return settings.content;
    }

    if (settings.input) {
        return getContentFromFiles(settings.input);
    }

    return "";
}
