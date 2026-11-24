/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { minify as swcMinify } from "@swc/core";
import { describe, expect, test } from "vitest";
import { swc } from "../src/index.ts";

describe("Package: swc errors", () => {
    test("wraps an swc failure and keeps swc's own error as cause", async () => {
        const original = await swcMinify("var a = ;", {
            compress: true,
            mangle: true,
        }).catch((e: unknown) => e);
        expect(original).toBeInstanceOf(Error);

        const error = await swc({
            // @ts-expect-error testing invalid input: settings is missing required fields
            settings: {},
            content: "var a = ;",
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/^swc minification failed: /);
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });
});
