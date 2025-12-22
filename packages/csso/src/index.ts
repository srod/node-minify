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
import { minify } from "csso";

/**
 * Run csso.
 * @param settings Csso options
 * @param content Content to minify
 * @param index Index of current file in array
 * @returns Minified content
 */
export async function csso({ settings, content, index }: MinifierOptions) {
    const { css } = await minify(content ?? "", settings?.options);
    if (settings && !settings.content && settings.output) {
        writeFile({
            file: settings.output,
            content: css,
            index,
        });
    }
    return css;
}
