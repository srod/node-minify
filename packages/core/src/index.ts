/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { Settings } from "@node-minify/types";
import { compress } from "./compress.ts";
import { compressInMemory } from "./compressInMemory.ts";
import { setup } from "./setup.ts";

/**
 * Run node-minify.
 * @param settings Settings from user input
 */
const minify = (settings: Settings) => {
    return new Promise((resolve, reject) => {
        const method: any = settings.content ? compressInMemory : compress;
        settings = setup(settings);
        if (!settings.sync) {
            method(settings)
                .then((minified: string) => {
                    if (settings.callback) {
                        settings.callback(null, minified);
                    }
                    resolve(minified);
                })
                .catch((err: Error) => {
                    if (settings.callback) {
                        settings.callback(err);
                    }
                    reject(err);
                });
        } else {
            const minified: string = method(settings);
            if (settings.callback) {
                settings.callback(null, minified);
            }
            resolve(minified);
        }
    });
};

/**
 * Expose `minify()`.
 */
minify.default = minify;
export default minify;
