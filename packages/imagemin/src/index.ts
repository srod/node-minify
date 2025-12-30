/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import imageminLib from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminPngquant from "imagemin-pngquant";

/**
 * Imagemin plugin options.
 */
export type ImageminOptions = {
    /**
     * Quality setting for JPEG/WebP compression (0-100).
     * @default 80
     */
    quality?: number;

    /**
     * Lossless compression for PNG/WebP.
     * @default false
     */
    lossless?: boolean;

    /**
     * Compression effort level for pngquant (1-10, where 10 is slowest).
     * @default 6
     */
    effort?: number;

    /**
     * Optimization level for gifsicle (1-3).
     * @default 1
     */
    optimizationLevel?: number;
};

/**
 * Run imagemin.
 * @param settings - Imagemin options
 * @param content - Image content to compress (Buffer)
 * @returns Compressed image content
 */
export async function imagemin({
    settings,
    content,
}: MinifierOptions<ImageminOptions>): Promise<CompressorResult> {
    if (!Buffer.isBuffer(content)) {
        throw new Error(
            "Imagemin compressor requires Buffer content. Ensure input is a binary image file."
        );
    }

    const options = settings?.options ?? {};

    // Determine plugins based on input or desired output
    // Default to using all three for comprehensive compression
    const plugins = [
        imageminMozjpeg({
            quality: options.quality ?? 80,
            progressive: true,
            smooth: 0,
            quantBaseline: false,
            arithmetic: false,
        }),
        imageminPngquant({
            quality: [options.quality ? options.quality / 100 : 0.8, 1],
            speed: 11 - (options.effort ?? 6), // invert: higher effort = lower speed
            strip: true,
            dithering: 1,
            posterize: 0,
        }),
        imageminGifsicle({
            optimizationLevel: options.optimizationLevel ?? 1,
            interlaced: true,
            colors: 256,
        }),
    ];

    const result = await imageminLib.buffer(content, {
        plugins,
    });

    if (!result || result.length === 0) {
        throw new Error("Imagemin returned no output");
    }

    const outputBuffer = Buffer.from(result);

    return {
        code: outputBuffer.toString("binary"),
        buffer: outputBuffer,
    };
}
