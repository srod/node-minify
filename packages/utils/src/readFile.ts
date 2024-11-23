/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { readFileSync } from "node:fs";

/**
 * Read content from file.
 * @param file File name
 */
export function readFile(file: string): string {
    return readFileSync(file, "utf8");
}
