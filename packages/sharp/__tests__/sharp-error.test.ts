/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import realSharp from "sharp";
import { describe, expect, test } from "vitest";
import { sharp } from "../src/index.ts";

// Real sharp, no mock: sharp.test.ts mocks the module, so this lives in its own file.
const notAnImage = Buffer.from("not an image");

describe("Package: sharp errors (real library)", () => {
    test("wraps a sharp failure, names the target format and keeps sharp's own error as cause", async () => {
        const original = await realSharp(notAnImage)
            .webp()
            .toBuffer()
            .catch((e: unknown) => e);
        expect(original).toBeInstanceOf(Error);

        const error = await sharp({
            settings: { compressor: sharp, options: { format: "webp" } },
            content: notAnImage,
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
            `sharp minification failed: conversion to webp: ${(original as Error).message}`
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
        expect(((error as Error).cause as Error).message).toBe(
            (original as Error).message
        );
    });

    test("names the format that failed in a multi-format run", async () => {
        const error = await sharp({
            settings: {
                compressor: sharp,
                options: { formats: ["avif", "png"] },
            },
            content: notAnImage,
        }).catch((e: unknown) => e);

        expect((error as Error).message).toMatch(
            /^sharp minification failed: conversion to avif: /
        );
        expect((error as Error).cause).toBeInstanceOf(Error);
    });

    test("leaves the non-Buffer validation error unwrapped", async () => {
        await expect(
            sharp({
                settings: { compressor: sharp, options: {} },
                content: "a string",
            })
        ).rejects.toThrow(/^Sharp compressor requires Buffer content\./);
    });
});
