/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import type SharpType from "sharp";

export type SharpOptions = {
    quality?: number;
    lossless?: boolean;
    effort?: number;
    format?: "webp" | "avif" | "png" | "jpeg";
    formats?: Array<"webp" | "avif">;
};

type SharpInput = MinifierOptions<SharpOptions>;

// Lazy-loaded sharp instance
let sharpLib: typeof SharpType | undefined;

/**
 * Get sharp instance, loading it lazily on first use.
 * This reduces initial bundle size for users who may not use the sharp compressor.
 */
async function getSharp(): Promise<typeof SharpType> {
    if (!sharpLib) {
        sharpLib = (await import("sharp")).default;
    }
    return sharpLib;
}

/**
 * Convert image to specified format using Sharp.
 */
async function convertImage(
    input: Buffer,
    format: "webp" | "avif" | "png" | "jpeg",
    options: SharpOptions
): Promise<Buffer> {
    const sharpInstance = await getSharp();
    let converter = sharpInstance(input);

    const clamp = (val: number, min: number, max: number) =>
        Math.max(min, Math.min(max, val));

    switch (format) {
        case "webp":
            converter = converter.webp({
                quality: clamp(options.quality ?? 80, 1, 100),
                lossless: options.lossless ?? false,
                effort: clamp(options.effort ?? 4, 0, 6),
            });
            break;
        case "avif":
            converter = converter.avif({
                quality: clamp(options.quality ?? 50, 1, 100),
                lossless: options.lossless ?? false,
                effort: clamp(options.effort ?? 4, 0, 9),
            });
            break;
        case "png":
            converter = converter.png({
                compressionLevel: clamp(options.effort ?? 6, 0, 9),
            });
            break;
        case "jpeg":
            converter = converter.jpeg({
                quality: clamp(options.quality ?? 90, 1, 100),
                mozjpeg: true,
            });
            break;
    }

    return converter.toBuffer();
}

/**
 * Minify/compress image using Sharp.
 * Supports single format output or multi-format conversion (e.g., PNG → WebP + AVIF).
 */
export async function sharp({
    settings,
    content,
}: SharpInput): Promise<CompressorResult> {
    if (!Buffer.isBuffer(content)) {
        throw new Error(
            "Sharp compressor requires Buffer content. Ensure input is a binary image file."
        );
    }

    const options = settings?.options ?? {};
    const inputBuffer = content;

    // Multi-format conversion (e.g., convert PNG to both WebP and AVIF)
    if (options.formats && options.formats.length > 0) {
        const outputs: CompressorResult["outputs"] = [];

        for (const format of options.formats) {
            const convertedBuffer = await convertImage(
                inputBuffer,
                format,
                options
            );
            outputs.push({
                format,
                content: convertedBuffer,
            });
        }

        return { outputs, code: "" };
    }

    // Single format conversion
    const format = options.format ?? "webp";
    const outputBuffer = await convertImage(inputBuffer, format, options);

    return {
        code: outputBuffer.toString("binary"),
        buffer: outputBuffer,
    };
}
