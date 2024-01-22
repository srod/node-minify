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
import uglifyJS from "uglify-js";

/**
 * Run uglifyJS.
 * @param settings UglifyJS options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyUglifyJS = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    const contentMinified = uglifyJS.minify(content ?? "", settings?.options);
    if (contentMinified.error) {
        if (callback) {
            return callback(contentMinified.error);
        }
    }
    if (
        contentMinified.map &&
        typeof settings?.options?.sourceMap === "object"
    ) {
        utils.writeFile({
            file:
                typeof settings.options.sourceMap.filename === "string"
                    ? settings.options.sourceMap.filename
                    : "",
            content: contentMinified.map,
            index,
        });
    }
    if (settings && !settings.content && settings.output) {
        utils.writeFile({
            file: settings.output,
            content: contentMinified.code,
            index,
        });
    }
    if (callback) {
        return callback(null, contentMinified.code);
    }
    return contentMinified.code;
};

/**
 * Expose `minifyUglifyJS()`.
 */
minifyUglifyJS.default = minifyUglifyJS;
export = minifyUglifyJS;
