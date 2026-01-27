/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import {
    extractSourceMapOption,
    getSourceMapBoolean,
} from "../src/sourceMap.ts";

describe("getSourceMapBoolean", () => {
    test("returns false for undefined options", () => {
        expect(getSourceMapBoolean(undefined)).toBe(false);
    });

    test("returns false for empty options object", () => {
        expect(getSourceMapBoolean({})).toBe(false);
    });

    test("returns false when sourceMap is false", () => {
        expect(getSourceMapBoolean({ sourceMap: false })).toBe(false);
    });

    test("returns false when sourceMap is null", () => {
        expect(getSourceMapBoolean({ sourceMap: null })).toBe(false);
    });

    test("returns false when sourceMap is undefined", () => {
        expect(getSourceMapBoolean({ sourceMap: undefined })).toBe(false);
    });

    test("returns true when sourceMap is true", () => {
        expect(getSourceMapBoolean({ sourceMap: true })).toBe(true);
    });

    test("returns true when sourceMap is 1", () => {
        expect(getSourceMapBoolean({ sourceMap: 1 })).toBe(true);
    });

    test("returns true when sourceMap is a non-empty string", () => {
        expect(getSourceMapBoolean({ sourceMap: "true" })).toBe(true);
    });

    test("returns true when sourceMap is an object", () => {
        expect(getSourceMapBoolean({ sourceMap: {} })).toBe(true);
    });

    test("ignores other options", () => {
        expect(
            getSourceMapBoolean({
                sourceMap: true,
                compress: true,
                mangle: false,
            })
        ).toBe(true);
    });
});

describe("extractSourceMapOption", () => {
    test("returns false and empty object for undefined options", () => {
        const result = extractSourceMapOption(undefined);
        expect(result.sourceMap).toBe(false);
        expect(result.restOptions).toEqual({});
    });

    test("returns false and empty object for empty options", () => {
        const result = extractSourceMapOption({});
        expect(result.sourceMap).toBe(false);
        expect(result.restOptions).toEqual({});
    });

    test("returns false and empty object when sourceMap is false", () => {
        const result = extractSourceMapOption({ sourceMap: false });
        expect(result.sourceMap).toBe(false);
        expect(result.restOptions).toEqual({});
    });

    test("returns true and empty object when sourceMap is true", () => {
        const result = extractSourceMapOption({ sourceMap: true });
        expect(result.sourceMap).toBe(true);
        expect(result.restOptions).toEqual({});
    });

    test("returns true and preserves other options", () => {
        const result = extractSourceMapOption({
            sourceMap: true,
            compress: true,
            mangle: false,
        });
        expect(result.sourceMap).toBe(true);
        expect(result.restOptions).toEqual({
            compress: true,
            mangle: false,
        });
    });

    test("returns false and preserves other options when sourceMap is false", () => {
        const result = extractSourceMapOption({
            sourceMap: false,
            compress: true,
            mangle: false,
        });
        expect(result.sourceMap).toBe(false);
        expect(result.restOptions).toEqual({
            compress: true,
            mangle: false,
        });
    });

    test("returns true when sourceMap is truthy value", () => {
        const result = extractSourceMapOption({ sourceMap: 1 });
        expect(result.sourceMap).toBe(true);
        expect(result.restOptions).toEqual({});
    });

    test("does not mutate original options object", () => {
        const original = { sourceMap: true, compress: true };
        const result = extractSourceMapOption(original);
        expect(original).toEqual({ sourceMap: true, compress: true });
        expect(result.restOptions).toEqual({ compress: true });
    });
});
