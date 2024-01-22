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
import { minify } from "csso";

/**
 * Run csso.
 * @param settings Csso options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyCSSO = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    const contentMinified = minify(content ?? "", settings?.options);
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
 * Expose `minifyCSSO()`.
 */
minifyCSSO.default = minifyCSSO;
export = minifyCSSO;
