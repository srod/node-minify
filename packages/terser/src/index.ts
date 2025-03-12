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
import { minify } from "terser";

/**
 * Run terser.
 * @param settings Terser options
 * @param content Content to minify
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function terser({
    settings,
    content,
    index,
}: MinifierOptions & {
    settings?: {
        options?: { sourceMap?: { url?: string } };
    };
}) {
    const contentMinified = await minify(content ?? "", settings?.options);
    if (
        contentMinified.map &&
        typeof settings?.options?.sourceMap?.url === "string" &&
        typeof contentMinified.map === "string"
    ) {
        writeFile({
            file: settings.options.sourceMap.url,
            content: contentMinified.map,
            index,
        });
    }
    if (typeof contentMinified.code !== "string") {
        throw new Error("Terser failed: empty result");
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
