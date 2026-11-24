/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import uglifyJS from "uglify-js";
import { describe, expect, test } from "vitest";
import { uglifyJs } from "../src/index.ts";

describe("Package: uglify-js errors", () => {
    test("wraps an uglify-js failure and keeps uglify-js's own error as cause", async () => {
        const original = uglifyJS.minify("var a = ;").error;
        expect(original).toBeInstanceOf(Error);

        const error = await uglifyJs({
            // @ts-expect-error testing invalid input: settings is missing required fields
            settings: {},
            content: "var a = ;",
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(
            /^uglify-js minification failed: /
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });
});
