/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { formatConsoleOutput } from "./console.ts";
import { formatJsonOutput } from "./json.ts";
import { formatMarkdownOutput } from "./markdown.ts";

/**
 * Selects and returns a reporter formatter function based on the provided format.
 *
 * @param format - The desired output format; supported values: `"json"`, `"markdown"` (or `"md"`), otherwise a console formatter is returned.
 * @returns The formatter function corresponding to the requested format: `formatJsonOutput` for `"json"`, `formatMarkdownOutput` for `"markdown"`/`"md"`, and `formatConsoleOutput` for any other value.
 */
export function getReporter(format: string = "console") {
    switch (format) {
        case "json":
            return formatJsonOutput;
        case "markdown":
        case "md":
            return formatMarkdownOutput;
        default:
            return formatConsoleOutput;
    }
}