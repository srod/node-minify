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
import jsonminify from "jsonminify";

/**
 * Run jsonminify.
 * @param settings JsonMinify options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyJsonMinify = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    const contentMinified = jsonminify(content ?? "");
    if (settings && !settings.content && settings.output) {
        settings.output &&
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
 * Expose `minifyJsonMinify()`.
 */
minifyJsonMinify.default = minifyJsonMinify;
export = minifyJsonMinify;
