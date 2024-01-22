/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import minify from "@node-minify/core";
import { Result, Settings } from "@node-minify/types";
import { utils } from "@node-minify/utils";

/**
 * Run compression.
 * @param options Settings
 */
const compress = (options: Settings): Promise<Result> => {
    return new Promise<Result>((resolve, reject) => {
        minify(options)
            .then(() => {
                if (options?.output?.includes("$1")) {
                    // npx node-minify --compressor uglify-js --input 'source/**/*.js' --output 'source/$1.min.js' --option '{"warnings": true, "mangle": false}'
                    return resolve({
                        compressorLabel: options.compressorLabel ?? "",
                        compressor: options.compressor,
                        size: "0",
                        sizeGzip: "0",
                    });
                }
                if (!options.output) {
                    return resolve({
                        compressorLabel: options.compressorLabel ?? "",
                        compressor: options.compressor,
                        size: "0",
                        sizeGzip: "0",
                    });
                }
                utils
                    .getFilesizeGzippedInBytes(options.output)
                    .then((sizeGzip: string) => {
                        resolve({
                            compressorLabel: options.compressorLabel ?? "",
                            compressor: options.compressor,
                            size: options.output
                                ? utils.getFilesizeInBytes(options.output)
                                : "0",
                            sizeGzip: sizeGzip,
                        });
                    })
                    .catch(reject);
            })
            .catch(reject);
    });
};

/**
 * Expose `compress()`.
 */
export { compress };
