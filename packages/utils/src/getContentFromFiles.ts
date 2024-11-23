/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, readFileSync } from "node:fs";
import { isValidFile } from "./isValidFile.ts";

/**
 * Concatenate all input files and get the data.
 * @param input Input files
 */
export function getContentFromFiles(input: string | string[]): string {
    if (!Array.isArray(input)) {
        return readFile(input);
    }

    return input.map(readFile).join("\n");
}

/**
 * Read file.
 * @param path
 * @returns
 */
const readFile = (path: string): string => {
    if (!existsSync(path) || isValidFile(path)) {
        return readFileSync(path, "utf8");
    }
    return "";
};
