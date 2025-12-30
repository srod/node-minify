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
    compressionLevel?: number;
    format?: "webp" | "avif" | "png" | "jpeg";
    formats?: Array<"webp" | "avif" | "png" | "jpeg">;
};

type SharpInput = MinifierOptions<SharpOptions>;

// Lazy-loaded sharp instance
let sharpLib: typeof SharpType | undefined;

/**
 * Lazily loads and returns the Sharp default export.
 *
 * @returns The loaded Sharp default export (constructor/function)
 */
async function getSharp(): Promise<typeof SharpType> {
    if (!sharpLib) {
        sharpLib = (await import("sharp")).default;
    }
    return sharpLib;
}

/**
 * Convert an image buffer into the specified output format using Sharp.
 *
 * @param input - Source image data as a Buffer
 * @param format - Target format: `"webp"`, `"avif"`, `"png"`, or `"jpeg"`
 * @param options - Encoding options (e.g., `quality`, `lossless`, `effort`, `compressionLevel`)
 * @returns A Buffer containing the encoded image in the requested format
 * @throws Error if Sharp fails to perform the conversion
 */
async function convertImage(
    input: Buffer,
    format: "webp" | "avif" | "png" | "jpeg",
    options: SharpOptions
): Promise<Buffer> {
    try {
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
 * Compresses an image using Sharp, producing either a single-format buffer or multiple format outputs.
 *
 * When `settings?.options.formats` is a non-empty array, converts the input to each listed format and returns `outputs` with `{ format, content }` entries. Otherwise converts to `settings?.options.format` (defaults to `webp`) and returns a single `buffer`.
 *
 * @param settings - Optional compressor settings; recognized keys include `format` (string) and `formats` (string[]), plus format-specific tuning options (quality, lossless, effort, compressionLevel).
 * @param content - The input image as a Buffer (binary). Must be a Buffer or an error is thrown.
 * @returns A CompressorResult containing either `outputs` (array of `{ format, content: Buffer }`) when multiple formats were requested, or `buffer` (Buffer) for a single-format conversion; `code` is provided as an empty string.
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