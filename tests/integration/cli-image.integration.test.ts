/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeAll, describe, expect, test } from "vitest";
import {
    createTempFixtures,
    getCLIPath,
    runCLI,
    type TempFixtures,
} from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLI_PATH = getCLIPath();
const testPngPath = path.resolve(__dirname, "../fixtures/images/test.png");
const testSvgPath = path.resolve(__dirname, "../fixtures/images/test.svg");

describe("CLI Image Integration Tests", () => {
    let fixtures: TempFixtures;

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
    });

    beforeAll(async () => {
        try {
            await fs.access(CLI_PATH);
        } catch {
            throw new Error(
                `CLI not built. Run 'bun run build' first. Expected: ${CLI_PATH}`
            );
        }
    });

    describe("Sharp CLI", () => {
        test("should convert PNG to WebP via CLI", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.webp");

            const result = await runCLI([
                "-c",
                "sharp",
                "-i",
                testPngPath,
                "-o",
                outputPath,
                "-O",
                '{"format":"webp"}',
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const outputBuffer = await fs.readFile(outputPath);
            expect(outputBuffer.toString("ascii", 8, 12)).toBe("WEBP");
        });

        test("should handle multiple inputs with $1 via CLI for images", async () => {
            fixtures = await createTempFixtures({});
            const img1 = path.join(fixtures.dir, "img1.png");
            const img2 = path.join(fixtures.dir, "img2.png");
            await fs.copyFile(testPngPath, img1);
            await fs.copyFile(testPngPath, img2);

            const result = await runCLI([
                "-c",
                "sharp",
                "-i",
                img1,
                "-i",
                img2,
                "-o",
                path.join(fixtures.dir, "$1.webp"),
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            expect(
                await fs
                    .access(path.join(fixtures.dir, "img1.webp"))
                    .then(() => true)
                    .catch(() => false)
            ).toBe(true);
            expect(
                await fs
                    .access(path.join(fixtures.dir, "img2.webp"))
                    .then(() => true)
                    .catch(() => false)
            ).toBe(true);
        });
    });

    describe("SVGO CLI", () => {
        test("should optimize SVG via CLI", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.svg");

            const result = await runCLI([
                "-c",
                "svgo",
                "-i",
                testSvgPath,
                "-o",
                outputPath,
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);

            const optimizedContent = await fs.readFile(outputPath, "utf-8");
            expect(optimizedContent).toContain("<svg");
        });
    });

    describe("Imagemin CLI", () => {
        test("should compress PNG via CLI", async () => {
            fixtures = await createTempFixtures({});
            const outputPath = path.join(fixtures.dir, "output.png");

            const result = await runCLI([
                "-c",
                "imagemin",
                "-i",
                testPngPath,
                "-o",
                outputPath,
                "-s",
            ]);

            expect(result.exitCode).toBe(0);
            const outputExists = await fs
                .access(outputPath)
                .then(() => true)
                .catch(() => false);
            expect(outputExists).toBe(true);
        });
    });
});
