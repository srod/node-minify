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
 * @deprecated uglify-es is no longer maintained. Please use @node-minify/terser instead.
 */
let deprecationWarned = false;

/**
 * Run uglifyES.
 * @param settings UglifyES options
 * @param content Content to minify
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function uglifyEs({
    settings,
    content,
    index,
}: MinifierOptions & {
    settings?: {
        options?: { sourceMap?: { filename?: string } };
    };
}) {
    if (!deprecationWarned) {
        console.warn(
            "[@node-minify/uglify-es] DEPRECATED: uglify-es is no longer maintained. " +
                "Please migrate to @node-minify/terser for continued support and modern JavaScript features."
        );
        deprecationWarned = true;
    }
    let content2: string | Record<string, string> = content ?? "";
    if (typeof settings.options?.sourceMap === "object") {
        content2 = {
            [settings.options.sourceMap.filename ?? ""]: content ?? "",
        };
    }
    const contentMinified = uglifyES.minify(content2, settings.options);
    if (contentMinified.error) {
        throw contentMinified.error;
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
    return contentMinified.code;
}
