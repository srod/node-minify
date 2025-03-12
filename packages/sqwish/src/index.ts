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
import minify from "sqwish";

/**
 * Run sqwish.
 * @param settings Sqwish options
 * @param content Content to minify
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function sqwish({ settings, content, index }: MinifierOptions) {
    const contentMinified = minify.minify(content, settings?.options?.strict);
    if (settings && !settings.content && settings.output) {
        writeFile({
            file: settings.output,
            content: contentMinified,
            index,
        });
    }
    return contentMinified;
}
