/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import imageminLib from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";
import { describe, expect, test, vi } from "vitest";
import { imagemin } from "../src/index.ts";

vi.mock("imagemin", () => {
    return {
        default: {
            buffer: vi.fn().mockImplementation(async () => {
                return new Uint8Array(Buffer.from("compressed"));
            }),
        },
    };
});

vi.mock("imagemin-gifsicle", () => {
    return {
        default: vi.fn().mockReturnValue(async (input: Buffer) => input),
    };
});

vi.mock("imagemin-mozjpeg", () => {
    return {
        default: vi.fn().mockReturnValue(async (input: Buffer) => input),
    };
});

vi.mock("imagemin-pngquant", () => {
    return {
        default: vi.fn().mockReturnValue(async (input: Buffer) => input),
    };
});

describe("Package: imagemin", () => {
    test("should compress image with default options", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await imagemin({
            settings: {
                compressor: imagemin,
                options: {},
            },
            content: inputBuffer,
        });

        expect(result.code).toBe("compressed");
        expect(result.buffer).toBeDefined();
    });

    test("should clamp quality, effort and optimizationLevel", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        await imagemin({
            settings: {
                compressor: imagemin,
                options: {
                    quality: 200,
                    effort: 20,
                    optimizationLevel: 5,
                },
            },
            content: inputBuffer,
        });

        expect(imageminMozjpeg).toHaveBeenCalledWith(
            expect.objectContaining({ quality: 100 })
        );

        expect(imageminPngquant).toHaveBeenCalledWith(
            expect.objectContaining({
                quality: [1, 1],
                speed: 1,
            })
        );

        expect(imageminGifsicle).toHaveBeenCalledWith(
            expect.objectContaining({ optimizationLevel: 3 })
        );

        await imagemin({
            settings: {
                compressor: imagemin,
                options: {
                    quality: -50,
                    effort: -5,
                    optimizationLevel: -1,
                },
            },
            content: inputBuffer,
        });

        expect(imageminMozjpeg).toHaveBeenCalledWith(
            expect.objectContaining({ quality: 0 })
        );

        expect(imageminPngquant).toHaveBeenCalledWith(
            expect.objectContaining({
                quality: [0, 1],
                speed: 10,
            })
        );

        expect(imageminGifsicle).toHaveBeenCalledWith(
            expect.objectContaining({ optimizationLevel: 1 })
        );
    });

    test("should compress image with custom quality", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await imagemin({
            settings: {
                compressor: imagemin,
                options: { quality: 75, effort: 4 },
            },
            content: inputBuffer,
        });

        expect(result.code).toBe("compressed");
        expect(result.buffer).toBeDefined();
    });

    test("should compress image with lossless option", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await imagemin({
            settings: {
                compressor: imagemin,
                options: { lossless: true },
            },
            content: inputBuffer,
        });

        expect(result.code).toBe("compressed");
        expect(result.buffer).toBeDefined();
    });

    test("should compress image with custom optimization level", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await imagemin({
            settings: {
                compressor: imagemin,
                options: { optimizationLevel: 2 },
            },
            content: inputBuffer,
        });

        expect(result.code).toBe("compressed");
        expect(result.buffer).toBeDefined();
    });

    test("should handle empty options object", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await imagemin({
            settings: {
                compressor: imagemin,
                options: {},
            },
            content: inputBuffer,
        });

        expect(result.code).toBe("compressed");
    });

    test("should throw error for non-Buffer content", async () => {
        await expect(
            imagemin({
                settings: {
                    compressor: imagemin,
                    options: {},
                },
                content: "not a buffer" as unknown as Buffer,
            })
        ).rejects.toThrow("Imagemin compressor requires Buffer content");
    });

    test("should throw error when imagemin returns empty result", async () => {
        vi.mocked(imageminLib.buffer).mockResolvedValueOnce(new Uint8Array(0));

        await expect(
            imagemin({
                settings: {
                    compressor: imagemin,
                    options: {},
                },
                content: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
            })
        ).rejects.toThrow("Imagemin returned no output");
    });
});
