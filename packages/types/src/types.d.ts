/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

/**
 * The return type of a compressor function.
 * @deprecated Use `CompressorResult` instead. Will be removed in v11.
 */
export type CompressorReturnType = string;

/**
 * Supported image formats for image compression.
 */
export type ImageFormat =
    | "webp"
    | "avif"
    | "png"
    | "jpeg"
    | "jpg"
    | "gif"
    | "tiff"
    | "heif"
    | "heic";

/**
 * Output result for multi-format image compression.
 */
export type CompressorOutput = {
    /**
     * Format of the output (e.g., 'webp', 'avif').
     */
    format?: string;

    /**
     * Output content as string or Buffer.
     */
    content: string | Buffer;
};

/**
 * Result returned by a compressor function.
 */
export type CompressorResult = {
    /**
     * Minified content as string (for text-based formats like JS, CSS, HTML, SVG).
     */
    code: string;

    /**
     * Source map (for JS/CSS compressors).
     */
    map?: string;

    /**
     * Minified content as Buffer (for binary formats like images).
     * @example
     * When using sharp for PNG/WebP compression
     */
    buffer?: Buffer;

    /**
     * Multiple outputs for multi-format image compression.
     * Used when converting to multiple formats simultaneously.
     * @example
     * [{ format: 'webp', content: <Buffer> }, { format: 'avif', content: <Buffer> }]
     */
    outputs?: CompressorOutput[];
};

/**
 * Base options that all compressors can accept.
 * Specific compressors may extend this with their own options.
 */
export type CompressorOptions = Record<string, unknown>;

/**
 * A compressor function that minifies content.
 * @param args - The minifier options including settings and content
 * @returns A promise resolving to the compression result
 */
export type Compressor<TOptions extends CompressorOptions = CompressorOptions> =
    (args: MinifierOptions<TOptions>) => Promise<CompressorResult>;

/**
 * File type for compressors that support multiple types (e.g., YUI).
 */
export type FileType = "js" | "css";

/**
 * User-facing settings for the minify function.
 * This is what users pass when calling minify().
 *
 * @example
 * ```ts
 * import { minify } from '@node-minify/core';
 * import { terser } from '@node-minify/terser';
 *
 * await minify({
 *   compressor: terser,
 *   input: 'src/*.js',
 *   output: 'dist/bundle.min.js',
 *   options: { mangle: true }
 * });
 * ```
 */
export type Settings<TOptions extends CompressorOptions = CompressorOptions> = {
    /**
     * The compressor function to use for minification.
     */
    compressor: Compressor<TOptions>;

    /**
     * Optional label for the compressor (used in logging).
     */
    compressorLabel?: string;

    /**
     * Content to minify (for in-memory minification).
     * If provided, input/output are not required.
     * For text-based formats (JS, CSS, HTML, SVG): string
     * For binary formats (images): Buffer (handled internally by image compressors)
     */
    content?: string | Buffer;

    /**
     * Input file path(s) or glob pattern.
     * Can be a single file, array of files, or wildcard pattern.
     *
     * @example
     * - 'src/app.js'
     * - ['src/a.js', 'src/b.js']
     * - 'src/**\/*.js'
     */
    input?: string | string[];

    /**
     * Output file path.
     * Use $1 as placeholder for input filename in multi-file scenarios.
     * Can be a single file, array of files, or pattern with $1.
     *
     * @example
     * - 'dist/bundle.min.js'
     * - ['file1.min.js', 'file2.min.js']
     * - '$1.min.js' (creates app.min.js from app.js)
     */
    output?: string | string[];

    /**
     * Compressor-specific options.
     * See individual compressor documentation for available options.
     */
    options?: TOptions;

    /**
     * CLI option string (used by CLI only).
     * @internal
     */
    option?: string;

    /**
     * Buffer size for file operations (in bytes).
     * @default 1024000 (1MB)
     */
    buffer?: number;

    /**
     * Timeout for the compressor process (in milliseconds).
     * If execution exceeds this limit, the process will be killed.
     */
    timeout?: number;

    /**
     * File type for compressors that support multiple types.
     * Required for YUI compressor.
     */
    type?: FileType;

    /**
     * Suppress console output.
     * @default false
     */
    silence?: boolean;

    /**
     * Public folder to prepend to input paths.
     *
     * @example
     * With publicFolder: 'public/js/' and input: 'app.js',
     * the actual path becomes 'public/js/app.js'
     */
    publicFolder?: string;

    /**
     * Replace files in place instead of creating new output files.
     * @default false
     */
    replaceInPlace?: boolean;

    /**
     * Allow empty output without throwing an error.
     * When true, if minification results in empty content, the output file will not be written.
     * Useful for CSS files containing only comments that get stripped.
     * @default false
     */
    allowEmptyOutput?: boolean;
};

/**
 * Options passed to compressor functions internally.
 * This is what compressors receive, not what users pass.
 */
export type MinifierOptions<
    TOptions extends CompressorOptions = CompressorOptions,
> = {
    /**
     * The full settings object.
     */
    settings: Settings<TOptions>;

    /**
     * The content to minify.
     * For text-based formats (JS, CSS, HTML, SVG): string
     * For binary formats (images): Buffer
     * For multiple binary files: Buffer[]
     */
    content?: string | Buffer | Buffer[];

    /**
     * Index of current file when processing multiple files.
     */
    index?: number;
};

/**
 * Result returned after compression (used by CLI).
 */
export type Result = {
    /**
     * Label of the compressor used.
     */
    compressorLabel: string;

    /**
     * Size of minified content (formatted string, e.g., "1.5 KB").
     */
    size: string;

    /**
     * Gzipped size of minified content (formatted string).
     */
    sizeGzip: string;
};

/**
 * Type alias for user convenience.
 * @deprecated Use `Settings` instead. Will be removed in v11.
 */
export type MinifyOptions<
    TOptions extends CompressorOptions = CompressorOptions,
> = Settings<TOptions>;
