/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import { MinifierOptions } from "@node-minify/types";
import { utils } from "@node-minify/utils";

/**
 * Just merge, no compression.
 * @param settings NoCompress options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const noCompress = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    if (settings && !settings.content && settings.output) {
        utils.writeFile({ file: settings.output, content, index });
    }
    if (callback) {
        return callback(null, content);
    }
    return content;
};

/**
 * Expose `noCompress()`.
 */
noCompress.default = noCompress;
export = noCompress;
