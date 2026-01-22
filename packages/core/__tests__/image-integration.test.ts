/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { readFileSync } from "node:fs";
import path, { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { sharp } from "../../sharp/src/index.ts";
import { svgo } from "../../svgo/src/index.ts";
import { minify } from "../src/index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testPng = resolve(__dirname, "../../../tests/fixtures/images/test.png");
const testSvg = resolve(__dirname, "../../../tests/fixtures/images/test.svg");

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
