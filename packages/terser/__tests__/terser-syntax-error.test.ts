/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { minify as terserMinify } from "terser";
import { describe, expect, test } from "vitest";
import { terser } from "../src/index.ts";

const invalidJs = "var a = ;";

describe("Package: terser syntax errors", () => {
    test("AE2: a syntax error reads `terser minification failed:` and keeps terser's own error as cause", async () => {
        const original = await terserMinify(invalidJs).catch((e: unknown) => e);
        expect(original).toBeInstanceOf(Error);

        const error = await terser({
            // @ts-expect-error testing invalid input: settings is missing required fields
            settings: {},
            content: invalidJs,
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(
            /^terser minification failed: /
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });
});
