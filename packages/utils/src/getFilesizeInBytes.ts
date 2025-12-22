/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { statSync } from "node:fs";
import { prettyBytes } from "./prettyBytes.ts";

/**
 * Get the file size as a human-readable string.
 * @param file - Path to the file
 * @returns Formatted file size string (e.g., "1.34 kB")
 * @example
 * getFilesizeInBytes('bundle.js') // '45.2 kB'
 */
export const getFilesizeInBytes = (file: string): string => {
    const stats = statSync(file);
    const fileSizeInBytes = stats.size;
    return prettyBytes(fileSizeInBytes);
};
