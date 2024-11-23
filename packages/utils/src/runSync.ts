/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorReturnType, Settings } from "@node-minify/types";

type RunSyncParameters = {
    settings: Settings;
    content?: string;
    index?: number;
};

/**
 * Run compressor in sync.
 * @param settings Settings
 * @param content Content to minify
 * @param index Index of the file being processed
 */
export function runSync({
    settings,
    content,
    index,
}: RunSyncParameters): CompressorReturnType {
    return settings.compressor({
        settings,
        content,
        callback: undefined,
        index,
    });
}
