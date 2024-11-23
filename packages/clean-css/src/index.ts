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
import CleanCSS from "clean-css";

/**
 * Run clean-css.
 * @param settings Clean-css options
 * @param content Content to minify
 * @param callback Callback
 * @param index Index of current file in array
 * @returns Minified content
 */
export function cleanCss({
    settings,
    content,
    callback,
    index,
}: MinifierOptions) {
    if (settings?.options?.sourceMap) {
        settings.options._sourceMap = settings.options.sourceMap;
        settings.options.sourceMap = true;
    }
    const _cleanCSS = new CleanCSS(
        settings && { returnPromise: false, ...settings.options }
    ).minify(content ?? "");
    const contentMinified = _cleanCSS.styles;
    if (
        _cleanCSS.sourceMap &&
        typeof settings?.options?._sourceMap === "object" &&
        "url" in settings.options._sourceMap
    ) {
        utils.writeFile({
            file:
                typeof settings.options._sourceMap.url === "string"
                    ? settings.options._sourceMap.url
                    : "",
            content: _cleanCSS.sourceMap.toString(),
            index,
        });
    }
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
}
