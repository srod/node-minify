/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { transform } from "lightningcss";
import { describe, expect, test } from "vitest";
import { lightningCss } from "../src/index.ts";

const invalidCss = "}}}";

describe("Package: lightningcss errors", () => {
    test("wraps a lightningcss failure and keeps lightningcss's own error as cause", async () => {
        let original: unknown;
        try {
            transform({
                filename: "input.css",
                code: Buffer.from(invalidCss),
                minify: true,
            });
        } catch (e) {
            original = e;
        }
        expect(original).toBeInstanceOf(Error);

        const error = await lightningCss({
            // @ts-expect-error testing invalid input: settings is missing required fields
            settings: {},
            content: invalidCss,
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(
            /^lightningcss minification failed: /
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });
});
