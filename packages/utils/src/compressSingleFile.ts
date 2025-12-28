/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";
import { getContentFromFiles } from "./getContentFromFiles.ts";
import { run } from "./run.ts";

/**
 * Compress a single file.
 * @param settings Settings
 */
export async function compressSingleFile(settings: Settings): Promise<string> {
    const content = determineContent(settings);
    return run({ settings, content });
}

/**
 * Determine the content to minify.
 * @param settings - Minification settings
 * @returns Content string to minify
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
