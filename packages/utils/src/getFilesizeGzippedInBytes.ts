/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { createReadStream } from "node:fs";
import { prettyBytes } from "./prettyBytes.ts";

/**
 * Get the gzipped file size in bytes.
 * @param file File name
 */
export async function getFilesizeGzippedInBytes(file: string): Promise<string> {
    const { gzipSizeStream } = await import("gzip-size");
    const source = createReadStream(file);
    const size = await new Promise<number>((resolve) => {
        source.pipe(gzipSizeStream()).on("gzip-size", resolve);
    });
    return prettyBytes(size);
}
