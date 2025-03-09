/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { ValidationError } from "./error.ts";

const UNITS = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"] as const;
type Unit = (typeof UNITS)[number];

/**
 * Get the size in human readable format.
 * From https://github.com/sindresorhus/pretty-bytes
 * @param num Number of bytes
 * @returns Human readable string
 * @throws {ValidationError} If input is not a finite number
 * @example
 * prettyBytes(1337) // '1.34 kB'
 * prettyBytes(100) // '100 B'
 */
export function prettyBytes(num: number): string {
    if (!Number.isFinite(num)) {
        throw new ValidationError(
            `Expected a finite number, got ${typeof num}: ${num}`
        );
    }

    const neg = num < 0;
    const absoluteNum = Math.abs(num);

    if (absoluteNum < 1) {
        return `${neg ? "-" : ""}${absoluteNum} B`;
    }

    const exponent = Math.min(
        Math.floor(Math.log(absoluteNum) / Math.log(1000)),
        UNITS.length - 1
    );

    const numStr = Number((absoluteNum / 1000 ** exponent).toPrecision(3));
    const unit = UNITS[exponent];

    return `${neg ? "-" : ""}${numStr} ${unit}`;
}
