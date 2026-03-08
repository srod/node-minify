/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { copyFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { sharp } from "../../sharp/src/index.ts";
import { svgo } from "../../svgo/src/index.ts";
import { minify } from "../src/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testPng = resolve(__dirname, "../../../tests/fixtures/images/test.png");
const testSvg = resolve(__dirname, "../../../tests/fixtures/images/test.svg");
const tmpDir = resolve(__dirname, "../../../tests/tmp");

describe("Image Integration Tests", () => {
    test("should compress PNG to WebP using sharp via minify()", async () => {
        const inputBuffer = readFileSync(testPng);

        const result = await minify({
            compressor: sharp,
            content: inputBuffer,
            options: {
                format: "webp",
            },
        });

        expect(result).toBeDefined();
    });

    test("should optimize SVG using svgo via minify()", async () => {
        const originalContent = readFileSync(testSvg, "utf8");

        const result = await minify({
            compressor: svgo,
            content: originalContent,
        });

        expect(result).toBeDefined();
        expect(result.length).toBeLessThan(originalContent.length);
        expect(result).toContain("<svg");
    });

    test("should convert to multiple formats with sharp via minify()", async () => {
        const inputBuffer = readFileSync(testPng);

        const result = await minify({
            compressor: sharp,
            content: inputBuffer,
            options: {
                formats: ["webp", "avif"],
            },
        });

        expect(result).toBeDefined();
    });

    test("should write multiple formats next to the input when output is $1", async () => {
        const inputFile = resolve(tmpDir, "sharp-multi-source.png");
        const webpOutput = resolve(tmpDir, "sharp-multi-source.webp");
        const avifOutput = resolve(tmpDir, "sharp-multi-source.avif");

        copyFileSync(testPng, inputFile);

        try {
            await minify({
                compressor: sharp,
                input: inputFile,
                output: "$1",
                options: {
                    formats: ["webp", "avif"],
                },
            });

            expect(existsSync(webpOutput)).toBe(true);
            expect(existsSync(avifOutput)).toBe(true);
        } finally {
            rmSync(inputFile, { force: true });
            rmSync(webpOutput, { force: true });
            rmSync(avifOutput, { force: true });
        }
    });

    test("should expand wildcard image inputs and keep multi-format outputs beside each source", async () => {
        const firstInput = resolve(tmpDir, "sharp-wildcard-a.png");
        const secondInput = resolve(tmpDir, "sharp-wildcard-b.png");
        const firstWebp = resolve(tmpDir, "sharp-wildcard-a.webp");
        const firstAvif = resolve(tmpDir, "sharp-wildcard-a.avif");
        const secondWebp = resolve(tmpDir, "sharp-wildcard-b.webp");
        const secondAvif = resolve(tmpDir, "sharp-wildcard-b.avif");
        const cwdFirstWebp = resolve(process.cwd(), "sharp-wildcard-a.webp");
        const cwdFirstAvif = resolve(process.cwd(), "sharp-wildcard-a.avif");
        const cwdSecondWebp = resolve(process.cwd(), "sharp-wildcard-b.webp");
        const cwdSecondAvif = resolve(process.cwd(), "sharp-wildcard-b.avif");
        const cwdOutputs = [
            cwdFirstWebp,
            cwdFirstAvif,
            cwdSecondWebp,
            cwdSecondAvif,
        ];
        const cwdOutputExistedBefore = new Map(
            cwdOutputs.map((file) => [file, existsSync(file)])
        );

        copyFileSync(testPng, firstInput);
        copyFileSync(testPng, secondInput);

        try {
            await minify({
                compressor: sharp,
                input: resolve(tmpDir, "sharp-wildcard-*.png"),
                output: "$1",
                options: {
                    formats: ["webp", "avif"],
                },
            });

            expect(existsSync(firstWebp)).toBe(true);
            expect(existsSync(firstAvif)).toBe(true);
            expect(existsSync(secondWebp)).toBe(true);
            expect(existsSync(secondAvif)).toBe(true);
        } finally {
            rmSync(firstInput, { force: true });
            rmSync(secondInput, { force: true });
            rmSync(firstWebp, { force: true });
            rmSync(firstAvif, { force: true });
            rmSync(secondWebp, { force: true });
            rmSync(secondAvif, { force: true });
            for (const file of cwdOutputs) {
                if (!cwdOutputExistedBefore.get(file)) {
                    rmSync(file, { force: true });
                }
            }
        }
    });

    test("should handle Buffer input for SVG via minify()", async () => {
        const svgBuffer = readFileSync(testSvg);

        const result = await minify({
            compressor: svgo,
            content: svgBuffer,
        });

        expect(result).toBeDefined();
        expect(result).toContain("<svg");
    });
});
