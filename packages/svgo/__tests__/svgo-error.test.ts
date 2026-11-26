/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { optimize } from "svgo";
import { describe, expect, test } from "vitest";
import { svgo } from "../src/index.ts";

const invalidSvg = "<svg><g></svg>";

describe("Package: svgo errors", () => {
    test("wraps an svgo failure and keeps svgo's own error as cause", async () => {
        let original: unknown;
        try {
            optimize(invalidSvg, { multipass: true });
        } catch (e) {
            original = e;
        }
        expect(original).toBeInstanceOf(Error);

        const error = await svgo({
            settings: { compressor: svgo, options: {} },
            content: invalidSvg,
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(/^svgo minification failed: /);
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });

    test("leaves the array-content validation error unwrapped", async () => {
        await expect(
            svgo({
                settings: { compressor: svgo, options: {} },
                content: [Buffer.from("<svg/>")],
            })
        ).rejects.toThrow(/^svgo compressor does not support array content$/);
    });
});
