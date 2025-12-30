import type { CompressorResult, MinifierOptions } from "@node-minify/types";

const defaultOptions = {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    useShortDoctype: true,
};

export async function htmlMinifier({
    settings,
    content,
}: MinifierOptions): Promise<CompressorResult> {
    const { minify } = await import("html-minifier-next");
    const options = { ...defaultOptions, ...settings?.options };
    const contentStr =
        content instanceof Buffer
            ? content.toString()
            : ((content ?? "") as string);
    const code = await minify(contentStr, options);

    return { code };
}
