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
import uglifyES from "uglify-es";

/**
 * Run uglifyES.
 * @param settings UglifyES options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
export function uglifyEs({
    settings,
    content,
    callback,
    index,
}: MinifierOptions & {
    settings?: {
        options?: { sourceMap?: { filename?: string } };
    };
}) {
    let content2: string | Record<string, string> = content ?? "";
    if (typeof settings.options?.sourceMap === "object") {
        content2 = {
            [settings.options.sourceMap.filename ?? ""]: content ?? "",
        };
    }
    const contentMinified = uglifyES.minify(content2, settings.options);
    if (contentMinified.error) {
        if (callback) {
            return callback(contentMinified.error);
        }
    }
    if (contentMinified.map && settings.options?.sourceMap) {
        writeFile({
            file: `${settings.output}.map`,
            content: contentMinified.map,
            index,
        });
    }
    if (settings && !settings.content && settings.output) {
        writeFile({
            file: settings.output,
            content: contentMinified.code,
            index,
        });
    }
    if (callback) {
        return callback(null, contentMinified.code);
    }
    return contentMinified.code;
}
