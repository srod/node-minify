/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

declare module "imagemin" {
    type Plugin = (input: Uint8Array) => Promise<Uint8Array>;

    interface BufferOptions {
        plugins?: Plugin[];
    }

    interface Imagemin {
        buffer(data: Uint8Array, options?: BufferOptions): Promise<Uint8Array>;
    }

    const imagemin: Imagemin;

    export default imagemin;
}

declare module "imagemin-gifsicle" {
    interface GifsicleOptions {
        optimizationLevel?: number;
        interlaced?: boolean;
        colors?: number;
    }

    function gifsicle(options?: GifsicleOptions): import("imagemin").Plugin;

    export default gifsicle;
}

declare module "imagemin-mozjpeg" {
    interface MozjpegOptions {
        quality?: number;
        progressive?: boolean;
        smooth?: number;
        baseline?: boolean;
        arithmetic?: boolean;
    }

    function mozjpeg(options?: MozjpegOptions): import("imagemin").Plugin;

    export default mozjpeg;
}

declare module "imagemin-pngquant" {
    interface PngquantOptions {
        quality?: [number, number];
        speed?: number;
        strip?: boolean;
        dithering?: number;
        posterize?: number;
    }

    function pngquant(options?: PngquantOptions): import("imagemin").Plugin;

    export default pngquant;
}
