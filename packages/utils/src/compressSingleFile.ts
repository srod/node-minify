/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorReturnType, Settings } from "@node-minify/types";
import { getContentFromFiles } from "./getContentFromFiles.ts";
import { runAsync } from "./runAsync.ts";
import { runSync } from "./runSync.ts";

/**
 * Compress a single file.
 * @param settings Settings
 */
export function compressSingleFileSync(
    settings: Settings
): CompressorReturnType {
    const content = determineContent(settings);
    return runSync({ settings, content });
}

export function compressSingleFileAsync(
    settings: Settings
): CompressorReturnType {
    const content = determineContent(settings);
    return runAsync({ settings, content });
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
