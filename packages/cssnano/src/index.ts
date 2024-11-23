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
import minify from "cssnano";
import postcss from "postcss";

/**
 * Run cssnano.
 * @param settings Cssnano options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function cssnano({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) {
    let contentMinified = { css: "" };
    try {
        contentMinified = await postcss([minify]).process(content || "", {
            from: undefined,
        });
    } catch (e) {
        if (callback) {
            return callback(e);
        }
    }
    if (settings && !settings.content && settings.output) {
        settings.output &&
            writeFile({
                file: settings.output,
                content: contentMinified.css,
                index,
            });
    }
    if (callback) {
        return callback(null, contentMinified.css);
    }
    return contentMinified.css;
}
