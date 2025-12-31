/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import type { CompressorResult, MinifierOptions } from "@node-minify/types";
import imageminLib from "imagemin";
import imageminGifsicle from "imagemin-gifsicle";
import imageminMozjpeg from "imagemin-mozjpeg";
import imageminOptipng from "imagemin-optipng";
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
 * Compresses an image buffer using imagemin and plugin configuration from `settings`.
 *
 * @param settings - Minifier settings; `settings.options` may contain ImageminOptions (quality, lossless, effort, optimizationLevel)
 * @param content - Image data to compress; must be a Buffer
 * @returns The compressed image as a `CompressorResult` containing `code` (binary string) and `buffer` (Buffer)
 * @throws Error if `content` is not a Buffer
 * @throws Error if imagemin produces no output
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

    const clamp = (val: number, min: number, max: number) =>
        Math.max(min, Math.min(max, val));
    const qualityClamped = clamp(options.quality ?? 80, 0, 100);
    const qualityNormalized = qualityClamped / 100;
    const effortClamped = clamp(options.effort ?? 6, 1, 10);
    const optimizationLevelClamped = clamp(
        options.optimizationLevel ?? 1,
        1,
        3
    );

    // Determine plugins based on input or desired output
    // Default to using all three for comprehensive compression
    const plugins = [
        imageminMozjpeg({
            quality: qualityClamped,
            progressive: true,
            smooth: 0,
            quantBaseline: false,
            arithmetic: false,
        }),
        imageminGifsicle({
            optimizationLevel: optimizationLevelClamped,
            interlaced: true,
            colors: 256,
        }),
    ];

    if (options.lossless) {
        plugins.push(
            imageminOptipng({
                optimizationLevel: optimizationLevelClamped,
            })
        );
    } else {
        plugins.push(
            imageminPngquant({
                quality: [qualityNormalized, 1],
                speed: 11 - effortClamped, // invert: higher effort = lower speed
                strip: true,
                dithering: 1,
                posterize: 0,
            })
        );
    }

    const result = await imageminLib.buffer(content, {
        plugins,
    });

    if (!result || result.length === 0) {
        throw new Error("Imagemin returned no output");
    }

    const outputBuffer = Buffer.from(result);

    return {
        code: outputBuffer.toString("latin1"),
        buffer: outputBuffer,
    };
}
