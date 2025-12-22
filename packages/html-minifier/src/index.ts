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

/**
 * Module variables.
 */
const defaultOptions = {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
};

/**
 * Run html-minifier-next.
 * @param settings HTMLMinifier options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
const minifyHTMLMinifier = async ({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) => {
    const { minify } = await import("html-minifier-next");
    const options = Object.assign({}, defaultOptions, settings?.options);
    const contentMinified = await minify(content ?? "", options);
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
 * Expose `minifyHTMLMinifier()`.
 */
minifyHTMLMinifier.default = minifyHTMLMinifier;
export = minifyHTMLMinifier;
