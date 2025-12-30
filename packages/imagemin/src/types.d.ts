/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

declare module "imagemin" {
    type Plugin = (input: Buffer | Uint8Array) => Promise<Buffer | Uint8Array>;

    interface BufferOptions {
        plugins?: Plugin[];
    }

    interface Imagemin {
        buffer(
            data: Buffer | Uint8Array,
            options?: BufferOptions
        ): Promise<Buffer | Uint8Array>;
    }

    const imagemin: Imagemin;

    export default imagemin;
}

declare module "imagemin-gifsicle" {
    interface GifsicleOptions {
        optimizationLevel?: number;
        interlaced?: boolean;
        colors?: number;
        lossy?: number;
    }

    function gifsicle(options?: GifsicleOptions): import("imagemin").Plugin;

    export default gifsicle;
}

declare module "imagemin-mozjpeg" {
    interface MozjpegOptions {
        quality?: number;
        progressive?: boolean;
        smooth?: number;
        quantBaseline?: boolean;
        arithmetic?: boolean;
        trellis?: boolean;
        notrellis?: boolean;
        trellisDC?: boolean;
        notrellisDC?: boolean;
        dcScanOpt?: 0 | 1 | 2;
        overshoot?: boolean;
        noovershoot?: boolean;
        dct?: "int" | "fast" | "float" | number;
        quantTable?: 0 | 1 | 2 | 3 | 4 | 5;
        tune?: "hvs-psnr" | "psnr" | "ssim" | "ms-ssim";
        fastCrush?: boolean;
        sample?: number;
        maxMemory?: number;
    }

    function mozjpeg(options?: MozjpegOptions): import("imagemin").Plugin;

    export default mozjpeg;
}

declare module "imagemin-pngquant" {
    interface PngquantOptions {
        quality?: [number, number];
        speed?: number;
        strip?: boolean;
        dithering?: number | boolean;
        posterize?: number;
        verbose?: boolean;
    }

    function pngquant(options?: PngquantOptions): import("imagemin").Plugin;

    export default pngquant;
}
