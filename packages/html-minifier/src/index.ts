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
    const code = await minify((content ?? "") as string, options);

    return { code };
}
