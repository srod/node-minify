/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
import type { CompressorReturnType, Settings } from "@node-minify/types";
import { compress } from "./compress.ts";
import { compressInMemory } from "./compressInMemory.ts";
import { setup } from "./setup.ts";

/**
 * Run node-minify.
 * @param settings Settings from user input
 */
export async function minify(settings: Settings): Promise<string> {
    const method = settings.content ? compressInMemory : compress;
    settings = setup(settings);

    try {
        let minified: CompressorReturnType;

        if (!settings.sync) {
            minified = await method(settings);
        } else {
            minified = method(settings) as string;
        }

        if (settings.callback) {
            settings.callback(null, minified);
        }

        return typeof minified === "string" ? minified : "";
    } catch (err) {
        if (settings.callback) {
            settings.callback(err as Error);
        }
        throw err;
    }
}

export function minifySync(settings: Settings): string {
    return "";
}
