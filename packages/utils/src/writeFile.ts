/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync, writeFileSync } from "node:fs";

type WriteFileParams = {
    file: string;
    content: any;
    index?: number;
};

/**
 * Write content into file.
 * @param file File name
 * @param content Content to write
 * @param index Index of the file being processed
 */
export function writeFile({ file, content, index }: WriteFileParams): string {
    const targetFile = index !== undefined ? file[index] : file;

    if (!targetFile) {
        throw new Error("No target file provided");
    }

    const shouldWrite =
        !existsSync(targetFile) || !lstatSync(targetFile).isDirectory();

    if (shouldWrite) {
        writeFileSync(targetFile, content, "utf8");
    }

    return content;
}
