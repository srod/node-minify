/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import imageminLib from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import { describe, expect, test } from "vitest";
import { imagemin } from "../src/index.ts";

// Real imagemin, no mock: a PNG signature followed by garbage makes pngquant fail.
const corruptPng = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    Buffer.from("garbage garbage garbage"),
]);

describe("Package: imagemin errors (real library)", () => {
    test("wraps an imagemin failure and keeps imagemin's own error as cause", async () => {
        // same plugin settings the compressor uses for its defaults
        const original = await imageminLib
            .buffer(corruptPng, {
                plugins: [
                    imageminPngquant({
                        quality: [0.8, 1],
                        speed: 5,
                        strip: true,
                        dithering: 1,
                        posterize: 0,
                    }),
                ],
            })
            .catch((e: unknown) => e);
        expect(original).toBeInstanceOf(Error);

        const error = await imagemin({
            settings: { compressor: imagemin, options: {} },
            content: corruptPng,
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toMatch(
            /^imagemin minification failed: /
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });
});
