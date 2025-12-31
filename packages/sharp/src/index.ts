/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import type { Sharp } from "sharp";

type SharpConstructor = (input: Buffer | string) => Sharp;

type BaseSharpOptions = {
    quality?: number;
    lossless?: boolean;
    effort?: number;
    compressionLevel?: number;
};

export type SharpOptions = BaseSharpOptions &
    (
        | { format?: "webp" | "avif" | "png" | "jpeg"; formats?: never }
        | { formats?: Array<"webp" | "avif" | "png" | "jpeg">; format?: never }
    );

type SharpInput = MinifierOptions<SharpOptions>;

// Lazy-loaded sharp instance
let sharpLib: SharpConstructor | undefined;

/**
 * Get sharp instance, loading it lazily on first use.
 * This reduces initial bundle size for users who may not use the sharp compressor.
 */
async function getSharp(): Promise<SharpConstructor> {
    if (!sharpLib) {
        sharpLib = (await import("sharp")).default;
    }
    return sharpLib;
}

const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

/**
 * Convert an image buffer to the specified image format.
 *
 * Options control per-format encoding parameters such as quality, lossless, effort, and compression level.
 *
 * @param input - Source image data as a Buffer
 * @param format - Target image format: `"webp"`, `"avif"`, `"png"`, or `"jpeg"`
 * @param options - Encoding options that adjust quality, lossless mode, effort, and compression level
 * @returns A Buffer containing the converted image data
 * @throws An Error prefixed with `Sharp conversion to <format> failed:` when conversion fails
 */
async function convertImage(
    input: Buffer,
    format: "webp" | "avif" | "png" | "jpeg",
    options: SharpOptions
): Promise<Buffer> {
    try {
        const sharpInstance = await getSharp();
        let converter = sharpInstance(input);

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
                    compressionLevel: clamp(
                        options.compressionLevel ?? options.effort ?? 6,
                        0,
                        9
                    ),
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
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(
                `Sharp conversion to ${format} failed: ${err.message}`
            );
        }
        throw err;
    }
}

/**
 * Compresses an image buffer to one or more target formats using Sharp.
 *
 * When `options.formats` is provided and non-empty, produces an `outputs` array with one entry per
 * requested format; otherwise converts to a single target format (default `"webp"`) and returns a
 * `buffer`.
 *
 * @param settings - Optional compressor settings object containing `options` (e.g., `format`, `formats`, `quality`, `lossless`, `effort`, `compressionLevel`).
 * @param content - The input image as a Buffer.
 * @returns An object containing either:
 *  - `outputs`: an array of `{ format, content }` entries when multiple formats were requested, or
 *  - `buffer`: a Buffer with the converted image for single-format conversion.
 *  The returned object also includes `code`, which is an empty string.
 * @throws If `content` is not a Buffer.
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
        code: "",
        buffer: outputBuffer,
    };
}
