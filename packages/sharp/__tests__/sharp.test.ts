/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test, vi } from "vitest";
import { sharp } from "../src/index.ts";

vi.mock("sharp", () => {
    const mockSharp = Object.assign(
        vi.fn().mockImplementation(() => ({
            webp: vi.fn().mockReturnThis(),
            avif: vi.fn().mockReturnThis(),
            png: vi.fn().mockReturnThis(),
            jpeg: vi.fn().mockReturnThis(),
            toBuffer: vi.fn().mockResolvedValue(Buffer.from("converted")),
        })),
        { cache: vi.fn() }
    );
    return { default: mockSharp };
});

describe("sharp", () => {
    test("should convert PNG to WebP", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await sharp({
            settings: {
                compressor: sharp,
                options: { format: "webp" },
            },
            content: inputBuffer,
        });

        expect(result.buffer).toBeInstanceOf(Buffer);
        expect(result.buffer?.length).toBeGreaterThan(0);
    });

    test("should convert PNG to AVIF", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await sharp({
            settings: {
                compressor: sharp,
                options: { format: "avif" },
            },
            content: inputBuffer,
        });

        expect(result.buffer).toBeInstanceOf(Buffer);
    });

    test("should convert to multiple formats", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await sharp({
            settings: {
                compressor: sharp,
                options: { formats: ["webp", "avif"] },
            },
            content: inputBuffer,
        });

        expect(result.outputs).toBeDefined();
        expect(result.outputs?.length).toBe(2);
        expect(result.outputs?.[0]?.format).toBe("webp");
        expect(result.outputs?.[1]?.format).toBe("avif");
        expect(result.outputs?.[0]?.content).toBeInstanceOf(Buffer);
        expect(result.outputs?.[1]?.content).toBeInstanceOf(Buffer);
    });

    test("should use default format (webp) when no format specified", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await sharp({
            settings: {
                compressor: sharp,
                options: {},
            },
            content: inputBuffer,
        });

        expect(result.buffer).toBeInstanceOf(Buffer);
    });

    test("should throw error for non-Buffer content", async () => {
        await expect(
            sharp({
                settings: {
                    compressor: sharp,
                    options: {},
                },
                content: "not a buffer" as unknown as Buffer,
            })
        ).rejects.toThrow("Sharp compressor requires Buffer content");
    });

    test("should handle quality option", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await sharp({
            settings: {
                compressor: sharp,
                options: { format: "webp", quality: 50 },
            },
            content: inputBuffer,
        });

        expect(result.buffer).toBeInstanceOf(Buffer);
    });

    test("should clamp quality and effort", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

        const result = await sharp({
            settings: {
                compressor: sharp,
                options: {
                    format: "webp",
                    quality: 200,
                    effort: 20,
                },
            },
            content: inputBuffer,
        });

        expect(result.buffer).toBeInstanceOf(Buffer);

        const result2 = await sharp({
            settings: {
                compressor: sharp,
                options: {
                    format: "avif",
                    quality: -50,
                    effort: -5,
                },
            },
            content: inputBuffer,
        });

        expect(result2.buffer).toBeInstanceOf(Buffer);

        const result3 = await sharp({
            settings: {
                compressor: sharp,
                options: {
                    format: "png",
                    effort: 20,
                },
            },
            content: inputBuffer,
        });

        expect(result3.buffer).toBeInstanceOf(Buffer);

        const result4 = await sharp({
            settings: {
                compressor: sharp,
                options: {
                    format: "jpeg",
                    quality: 200,
                },
            },
            content: inputBuffer,
        });

        expect(result4.buffer).toBeInstanceOf(Buffer);
    });

    test("should use compressionLevel for PNG when provided", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        const { default: mockSharp } = await import("sharp");
        const pngMock = vi.fn().mockReturnThis();
        // @ts-ignore
        mockSharp.mockImplementationOnce(() => ({
            png: pngMock,
            toBuffer: vi.fn().mockResolvedValue(Buffer.from("converted")),
        }));

        await sharp({
            settings: {
                compressor: sharp,
                options: {
                    format: "png",
                    compressionLevel: 8,
                },
            },
            content: inputBuffer,
        });

        expect(pngMock).toHaveBeenCalledWith(
            expect.objectContaining({ compressionLevel: 8 })
        );
    });

    test("should wrap and rethrow sharp errors", async () => {
        const inputBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
        const { default: mockSharp } = await import("sharp");
        // @ts-ignore
        mockSharp.mockImplementationOnce(() => ({
            webp: vi.fn().mockImplementation(() => {
                throw new Error("Sharp error");
            }),
        }));

        await expect(
            sharp({
                settings: {
                    compressor: sharp,
                    options: { format: "webp" },
                },
                content: inputBuffer,
            })
        ).rejects.toThrow("Sharp conversion to webp failed: Sharp error");
    });
});
