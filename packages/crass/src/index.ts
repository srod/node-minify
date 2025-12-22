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
import minify from "crass";

let deprecationWarned = false;

/**
 * Run crass.
 * @param settings Crass options
 * @param content Content to minify
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function crass({ settings, content, index }: MinifierOptions) {
    if (!deprecationWarned) {
        console.warn(
            "[@node-minify/crass] DEPRECATED: crass is no longer maintained. " +
                "Please migrate to @node-minify/cssnano or @node-minify/clean-css."
        );
        deprecationWarned = true;
    }
    const contentMinified = minify.parse(content).optimize().toString();
    if (settings && !settings.content && settings.output) {
        settings.output &&
            writeFile({
                file: settings.output,
                content: contentMinified,
                index,
            });
    }
    return contentMinified;
}
