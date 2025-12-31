/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minify } from "@node-minify/core";
import { type ImageminOptions, imagemin } from "@node-minify/imagemin";
import { type SharpOptions, sharp } from "@node-minify/sharp";
import { type SvgOptions, svgo } from "@node-minify/svgo";
import { afterEach, describe, expect, test } from "vitest";
import { createTempFixtures, type TempFixtures } from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testPngPath = path.resolve(__dirname, "../fixtures/images/test.png");
const testSvgPath = path.resolve(__dirname, "../fixtures/images/test.svg");
const staticPngPath = path.resolve(__dirname, "../../static/node-minify.png");
const staticSvgPath = path.resolve(__dirname, "../../static/node-minify.svg");

describe("Image Integration Tests", () => {
    let fixtures: TempFixtures;

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
    });

    describe("Sharp compressor", () => {
        test("should convert PNG to WebP format", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.webp");

            await minify<SharpOptions>({
                compressor: sharp,
                input: testPngPath,
                output: outputPath,
                options: {
                    format: "webp",
                    quality: 80,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputBuffer = await fs.readFile(outputPath);
            expect(outputBuffer.length).toBeGreaterThan(0);

            const header = outputBuffer.toString("ascii", 0, 4);
            expect(header).toBe("RIFF");
            const webpMarker = outputBuffer.toString("ascii", 8, 12);
            expect(webpMarker).toBe("WEBP");
        });

        test("should convert PNG to AVIF format", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.avif");

            await minify<SharpOptions>({
                compressor: sharp,
                input: testPngPath,
                output: outputPath,
                options: {
                    format: "avif",
                    quality: 50,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputBuffer = await fs.readFile(outputPath);
            expect(outputBuffer.length).toBeGreaterThan(0);

            const fileContent = outputBuffer.toString("binary", 0, 32);
            expect(fileContent).toContain("ftyp");
        });

        test("should optimize PNG (re-compress as PNG)", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.png");
            const originalSize = (await fs.stat(testPngPath)).size;

            await minify<SharpOptions>({
                compressor: sharp,
                input: testPngPath,
                output: outputPath,
                options: {
                    format: "png",
                    effort: 9,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputBuffer = await fs.readFile(outputPath);
            expect(outputBuffer.length).toBeGreaterThan(0);

            expect(outputBuffer[0]).toBe(0x89);
            expect(outputBuffer[1]).toBe(0x50);
            expect(outputBuffer[2]).toBe(0x4e);
            expect(outputBuffer[3]).toBe(0x47);

            const outputSize = (await fs.stat(outputPath)).size;
            expect(outputSize).toBeLessThanOrEqual(originalSize * 1.5);
        });

        test("should use smaller test image for compression", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.webp");
            const originalSize = (await fs.stat(staticPngPath)).size;

            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: outputPath,
                options: {
                    format: "webp",
                    quality: 80,
                },
            });

            const outputSize = (await fs.stat(outputPath)).size;
            expect(outputSize).toBeLessThan(originalSize);
        });

        test("should handle lossless WebP compression", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.webp");

            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: outputPath,
                options: {
                    format: "webp",
                    lossless: true,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputBuffer = await fs.readFile(outputPath);
            expect(outputBuffer.length).toBeGreaterThan(0);
        });

        test("should convert to JPEG format", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.jpg");

            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: outputPath,
                options: {
                    format: "jpeg",
                    quality: 85,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputBuffer = await fs.readFile(outputPath);
            expect(outputBuffer[0]).toBe(0xff);
            expect(outputBuffer[1]).toBe(0xd8);
        });
    });

    describe("SVGO compressor", () => {
        test("should optimize SVG from file", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.svg");
            const originalContent = await fs.readFile(testSvgPath, "utf-8");

            await minify<SvgOptions>({
                compressor: svgo,
                input: testSvgPath,
                output: outputPath,
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const optimizedContent = await fs.readFile(outputPath, "utf-8");
            expect(optimizedContent.length).toBeLessThan(
                originalContent.length
            );
            expect(optimizedContent).toContain("<svg");
        });

        test("should optimize complex SVG", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.svg");
            const originalContent = await fs.readFile(staticSvgPath, "utf-8");
            const originalSize = originalContent.length;

            await minify<SvgOptions>({
                compressor: svgo,
                input: staticSvgPath,
                output: outputPath,
            });

            const optimizedContent = await fs.readFile(outputPath, "utf-8");
            expect(optimizedContent.length).toBeLessThan(originalSize);
            expect(optimizedContent).toContain("<svg");
            expect(optimizedContent).toContain("viewBox");
        });

        test("should optimize SVG from in-memory content", async () => {
            const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
    <!-- This is a comment that should be removed -->
    <title>Test SVG</title>
    <desc>A test SVG image</desc>
    <rect x="0" y="0" width="100" height="100" fill="#ff0000"/>
    <circle cx="50" cy="50" r="25" fill="#00ff00"/>
</svg>`;

            const result = await minify<SvgOptions>({
                compressor: svgo,
                content: svgContent,
            });

            expect(typeof result).toBe("string");
            expect((result as string).length).toBeLessThan(svgContent.length);
            expect(result).toContain("<svg");
            expect(result).not.toContain("<!--");
        });

        test("should preserve viewBox when optimizing", async () => {
            const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="blue"/>
</svg>`;

            const result = await minify<SvgOptions>({
                compressor: svgo,
                content: svgContent,
            });

            expect(result).toContain("viewBox");
        });

        test("should handle SVG with custom options", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.svg");

            await minify<SvgOptions>({
                compressor: svgo,
                input: testSvgPath,
                output: outputPath,
                options: {
                    multipass: true,
                    floatPrecision: 2,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const optimizedContent = await fs.readFile(outputPath, "utf-8");
            expect(optimizedContent).toContain("<svg");
        });
    });

    describe("Imagemin compressor", () => {
        test("should compress PNG image", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.png");
            const originalSize = (await fs.stat(staticPngPath)).size;

            await minify<ImageminOptions>({
                compressor: imagemin,
                input: staticPngPath,
                output: outputPath,
                options: {
                    quality: 80,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputSize = (await fs.stat(outputPath)).size;
            expect(outputSize).toBeLessThanOrEqual(originalSize * 1.1);
        });

        test("should compress PNG with lossless mode", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.png");

            await minify<ImageminOptions>({
                compressor: imagemin,
                input: staticPngPath,
                output: outputPath,
                options: {
                    lossless: true,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputBuffer = await fs.readFile(outputPath);
            expect(outputBuffer[0]).toBe(0x89);
            expect(outputBuffer[1]).toBe(0x50);
        });

        test("should handle compression with custom effort", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.png");

            await minify<ImageminOptions>({
                compressor: imagemin,
                input: staticPngPath,
                output: outputPath,
                options: {
                    quality: 90,
                    effort: 10,
                },
            });

            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);
        });
    });

    describe("Cross-compressor scenarios", () => {
        test("should convert image with sharp then verify format", async () => {
            fixtures = await createTempFixtures({});
            const webpPath = path.join(fixtures.dir, "image.webp");
            const avifPath = path.join(fixtures.dir, "image.avif");

            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: webpPath,
                options: {
                    format: "webp",
                    quality: 80,
                },
            });

            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: avifPath,
                options: {
                    format: "avif",
                    quality: 60,
                },
            });

            const originalSize = (await fs.stat(staticPngPath)).size;
            const webpSize = (await fs.stat(webpPath)).size;
            const avifSize = (await fs.stat(avifPath)).size;

            expect(webpSize).toBeLessThan(originalSize);
            expect(avifSize).toBeLessThan(originalSize);
        });

        test("should handle multiple image formats in sequence", async () => {
            fixtures = await createTempFixtures({});

            const svgOutput = path.join(fixtures.dir, "optimized.svg");
            await minify<SvgOptions>({
                compressor: svgo,
                input: testSvgPath,
                output: svgOutput,
            });

            const webpOutput = path.join(fixtures.dir, "converted.webp");
            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: webpOutput,
                options: { format: "webp" },
            });

            const pngOutput = path.join(fixtures.dir, "compressed.png");
            await minify<ImageminOptions>({
                compressor: imagemin,
                input: staticPngPath,
                output: pngOutput,
                options: { quality: 80 },
            });

            const svgExists = await fs
                .access(svgOutput)
                .then(() => true)
                .catch(() => false);
            const webpExists = await fs
                .access(webpOutput)
                .then(() => true)
                .catch(() => false);
            const pngExists = await fs
                .access(pngOutput)
                .then(() => true)
                .catch(() => false);

            expect(svgExists).toBe(true);
            expect(webpExists).toBe(true);
            expect(pngExists).toBe(true);
        });
    });

    describe("Error handling", () => {
        test("should throw error for non-existent input file", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.webp");

            await expect(
                minify<SharpOptions>({
                    compressor: sharp,
                    input: "/non/existent/file.png",
                    output: outputPath,
                    options: { format: "webp" },
                })
            ).rejects.toThrow();
        });

        test("should throw error for invalid SVG content", async () => {
            await expect(
                minify<SvgOptions>({
                    compressor: svgo,
                    content: "<svg><invalid-unclosed",
                })
            ).rejects.toThrow();
        });

        test("should throw error when sharp receives non-buffer content", async () => {
            await expect(
                minify<SharpOptions>({
                    compressor: sharp,
                    content: "not a buffer" as unknown as Buffer,
                })
            ).rejects.toThrow("Buffer");
        });

        test("should throw error when imagemin receives non-buffer content", async () => {
            await expect(
                minify<ImageminOptions>({
                    compressor: imagemin,
                    content: "not a buffer" as unknown as Buffer,
                })
            ).rejects.toThrow("Buffer");
        });
    });

    describe("Quality settings", () => {
        test("should produce smaller file with lower quality", async () => {
            fixtures = await createTempFixtures({});
            const highQualityPath = path.join(fixtures.dir, "high.webp");
            const lowQualityPath = path.join(fixtures.dir, "low.webp");

            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: highQualityPath,
                options: {
                    format: "webp",
                    quality: 100,
                },
            });

            await minify<SharpOptions>({
                compressor: sharp,
                input: staticPngPath,
                output: lowQualityPath,
                options: {
                    format: "webp",
                    quality: 20,
                },
            });

            const highSize = (await fs.stat(highQualityPath)).size;
            const lowSize = (await fs.stat(lowQualityPath)).size;

            expect(lowSize).toBeLessThan(highSize);
        });
    });
});
