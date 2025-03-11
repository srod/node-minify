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
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function noCompress({
    settings,
    content,
    index,
}: MinifierOptions) {
    if (typeof content !== "string") {
        throw new Error("no-compress failed: empty result");
    }
    if (settings?.output && !settings?.content) {
        // If output path is specified and content setting is not present, write to file
        writeFile({ file: settings.output, content, index });
    }
    return content;
}
