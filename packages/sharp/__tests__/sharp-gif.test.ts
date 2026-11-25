/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { readFileSync } from "node:fs";
import realSharp from "sharp";
import { describe, expect, test } from "vitest";
import { filesImages } from "../../../tests/files-path.ts";
import { sharp } from "../src/index.ts";

// Real sharp, no mock: sharp.test.ts mocks the module, so this lives in its own file.
const png = readFileSync(filesImages.filePNG);
const animatedGif = readFileSync(filesImages.fileAnimatedGIF);
const ANIMATED_FRAME_COUNT = 3;

describe("Package: sharp GIF output (real library)", () => {
    test("converts a PNG to GIF with format: 'gif'", async () => {
        const result = await sharp({
            settings: { compressor: sharp, options: { format: "gif" } },
            content: png,
        });

        expect(result.buffer?.subarray(0, 4).toString("latin1")).toBe("GIF8");
        expect((await realSharp(result.buffer).metadata()).format).toBe("gif");
    });

    test("emits a GIF next to other formats with formats: [...]", async () => {
        const result = await sharp({
            settings: {
                compressor: sharp,
                options: { formats: ["webp", "gif"] },
            },
            content: png,
        });

        expect(result.outputs?.map((output) => output.format)).toEqual([
            "webp",
            "gif",
        ]);
        const gif = result.outputs?.[1]?.content;
        if (!Buffer.isBuffer(gif)) {
            throw new Error("expected the gif output to be a Buffer");
        }
        expect(gif.subarray(0, 4).toString("latin1")).toBe("GIF8");
        expect((await realSharp(gif).metadata()).format).toBe("gif");
    });

    test("keeps every frame of an animated GIF", async () => {
        expect((await realSharp(animatedGif).metadata()).pages).toBe(
            ANIMATED_FRAME_COUNT
        );

        const result = await sharp({
            settings: { compressor: sharp, options: { format: "gif" } },
            content: animatedGif,
        });

        const metadata = await realSharp(result.buffer).metadata();
        expect(metadata.format).toBe("gif");
        expect(metadata.pages).toBe(ANIMATED_FRAME_COUNT);
    });

    test("leaves other formats reading only the first frame", async () => {
        const result = await sharp({
            settings: { compressor: sharp, options: { format: "webp" } },
            content: animatedGif,
        });

        const metadata = await realSharp(result.buffer).metadata();
        expect(metadata.format).toBe("webp");
        expect(metadata.pages ?? 1).toBe(1);
    });

    test.each([
        [0, 1],
        [99, 10],
    ])("clamps effort %i to sharp's GIF effort %i", async (effort, clamped) => {
        const result = await sharp({
            settings: {
                compressor: sharp,
                options: { format: "gif", effort },
            },
            content: png,
        });
        const expected = await realSharp(png)
            .gif({ effort: clamped })
            .toBuffer();

        expect(result.buffer?.equals(expected)).toBe(true);
    });

    test("defaults GIF effort to 7", async () => {
        const result = await sharp({
            settings: { compressor: sharp, options: { format: "gif" } },
            content: png,
        });
        const expected = await realSharp(png).gif({ effort: 7 }).toBuffer();

        expect(result.buffer?.equals(expected)).toBe(true);
    });
});
