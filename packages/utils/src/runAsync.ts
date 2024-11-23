/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import type { Settings } from "@node-minify/types";

type RunAsyncParameters = {
    settings: Settings;
    content?: string;
    index?: number;
};

/**
 * Run compressor in async.
 * @param settings Settings
 * @param content Content to minify
 * @param index Index of the file being processed
 */
export async function runAsync({
    settings,
    content,
    index,
}: RunAsyncParameters): Promise<string> {
    return new Promise((resolve, reject) => {
        settings.compressor({
            settings,
            content,
            callback: (err: unknown, result?: string) =>
                err ? reject(err) : resolve(result as string),
            index,
        });
    });
}
