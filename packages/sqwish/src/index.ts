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
import sqwish from "sqwish";

/**
 * Run sqwish.
 * @param settings Sqwish options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifySqwish = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    const contentMinified = sqwish.minify(content, settings?.options?.strict);
    if (settings && !settings.content && settings.output) {
        utils.writeFile({
            file: settings.output,
            content: contentMinified,
            index,
        });
    }
    if (callback) {
        return callback(null, contentMinified);
    }
    return contentMinified;
};

/**
 * Expose `minifySqwish()`.
 */
minifySqwish.default = minifySqwish;
export = minifySqwish;
