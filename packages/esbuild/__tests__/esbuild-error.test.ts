/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { transform } from "esbuild";
import { describe, expect, test } from "vitest";
import { esbuild } from "../src/index.ts";

describe("Package: esbuild errors", () => {
    test("wraps an esbuild failure and keeps esbuild's own error as cause", async () => {
        const original = await transform("var a = ;", {
            loader: "js",
            minify: true,
        }).catch((e: unknown) => e);
        expect(original).toBeInstanceOf(Error);

        const error = await esbuild({
            // @ts-expect-error testing invalid input: settings is missing required fields
            settings: { type: "js" },
            content: "var a = ;",
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(
            /^esbuild minification failed: /
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });

    test("wraps a css failure too", async () => {
        const error = await esbuild({
            // @ts-expect-error testing invalid input: settings is missing required fields
            settings: { type: "css" },
            content: "/* unterminated",
        }).catch((e: unknown) => e);

        expect((error as Error).message).toMatch(
            /^esbuild minification failed: /
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
    });

    test("leaves the missing-type validation error unwrapped", async () => {
        await expect(
            // @ts-expect-error testing invalid input: settings is missing required fields
            esbuild({ settings: {}, content: "var a = 1;" })
        ).rejects.toThrow(/^You must specify a type: js or css$/);
    });
});
