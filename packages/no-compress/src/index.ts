/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { MinifierOptions } from "@node-minify/types";
import { writeFile } from "@node-minify/utils";

/**
 * Just merge, no compression.
 * @param settings NoCompress options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
export function noCompress({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) {
    // If output path is specified and content setting is not present, write to file
    if (settings?.output && !settings?.content) {
        writeFile({ file: settings.output, content, index });
    }

    // Handle callback if provided, otherwise return content directly
    return callback ? callback(null, content) : content;
}
