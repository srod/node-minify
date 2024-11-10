/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { MinifierOptions } from "@node-minify/types";
import { utils } from "@node-minify/utils";
import cssnano from "cssnano";
import postcss from "postcss";

/**
 * Run cssnano.
 * @param settings Cssnano options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyCssnano = async ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    let contentMinified = { css: "" };
    try {
        contentMinified = await postcss([cssnano]).process(content || "", {
            from: undefined,
        });
    } catch (e) {
        if (callback) {
            return callback(e);
        }
    }
    if (settings && !settings.content && settings.output) {
        settings.output &&
            utils.writeFile({
                file: settings.output,
                content: contentMinified.css,
                index,
            });
    }
    if (callback) {
        return callback(null, contentMinified.css);
    }
    return contentMinified.css;
};

/**
 * Expose `minifyCssnano()`.
 */
minifyCssnano.default = minifyCssnano;
export default minifyCssnano;
