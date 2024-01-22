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
import crass from "crass";

/**
 * Run crass.
 * @param settings Crass options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyCrass = ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    const contentMinified = crass.parse(content).optimize().toString();
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
 * Expose `minifyCrass()`.
 */
minifyCrass.default = minifyCrass;
export = minifyCrass;
