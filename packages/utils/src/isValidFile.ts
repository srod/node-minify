/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { existsSync, lstatSync } from "node:fs";

/**
 * Check if the path is a valid file.
 * @param path
 * @returns
 */
export function isValidFile(path: string): boolean {
    return existsSync(path) && !lstatSync(path).isDirectory();
}
