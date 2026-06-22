import { cleanCss } from "@node-minify/clean-css";
import { minify } from "@node-minify/core";
import { cssnano } from "@node-minify/cssnano";
import { csso } from "@node-minify/csso";
import { esbuild } from "@node-minify/esbuild";
import { gcc } from "@node-minify/google-closure-compiler";
import { htmlMinifier } from "@node-minify/html-minifier";
import { imagemin } from "@node-minify/imagemin";
import { jsonMinify } from "@node-minify/jsonminify";
import { lightningCss } from "@node-minify/lightningcss";
import { noCompress } from "@node-minify/no-compress";
import { oxc } from "@node-minify/oxc";
import { sharp } from "@node-minify/sharp";
import { svgo } from "@node-minify/svgo";
import { swc } from "@node-minify/swc";
import { terser } from "@node-minify/terser";
import { uglifyJs } from "@node-minify/uglify-js";

// Helper to run examples and log results
const run = async (name, fn) => {
    try {
        const result = await fn();
        console.log(`✓ ${name}`);
        return result;
    } catch (err) {
        console.error(`✗ ${name}:`, err.message);
    }
};

// ============================================
// JavaScript Examples
// ============================================

const contentJS = `var tools = true; if(tools){ console.log('true'); }`;

// GCC with content (in-memory)
await run("GCC - content in-memory", () =>
    minify({
        compressor: gcc,
        content: contentJS,
        output: "public/js-dist/gcc-contentJS.js",
    })
);

// GCC - single file
await run("GCC - single file", () =>
    minify({
        compressor: gcc,
        input: "public/js/sample.js",
        output: "public/js-dist/gcc-onefile.js",
    })
);

// GCC - concat multiple files
await run("GCC - concat files", () =>
    minify({
        compressor: gcc,
        input: ["public/js/sample.js", "public/js/sample2.js"],
        output: "public/js-dist/gcc-concat.js",
    })
);

// GCC - wildcards
await run("GCC - wildcards", () =>
    minify({
        compressor: gcc,
        input: "public/js/**/*.js",
        output: "public/js-dist/gcc-wildcards.js",
    })
);

// Terser - concat
await run("Terser - concat", () =>
    minify({
        compressor: terser,
        input: ["public/js/sample.js", "public/js/sample2.js"],
        output: "public/js-dist/terser-concat.js",
    })
);

// esbuild - JS single file
await run("esbuild - JS single file", () =>
    minify({
        compressor: esbuild,
        input: "public/js/sample.js",
        output: "public/js-dist/esbuild-onefile.js",
        type: "js",
    })
);

// esbuild - JS concat
await run("esbuild - JS concat", () =>
    minify({
        compressor: esbuild,
        input: ["public/js/sample.js", "public/js/sample2.js"],
        output: "public/js-dist/esbuild-concat.js",
        type: "js",
    })
);

// swc - single file
await run("swc - single file", () =>
    minify({
        compressor: swc,
        input: "public/js/sample.js",
        output: "public/js-dist/swc-onefile.js",
    })
);

// swc - concat
await run("swc - concat", () =>
    minify({
        compressor: swc,
        input: ["public/js/sample.js", "public/js/sample2.js"],
        output: "public/js-dist/swc-concat.js",
    })
);

// oxc - single file
await run("oxc - single file", () =>
    minify({
        compressor: oxc,
        input: "public/js/sample.js",
        output: "public/js-dist/oxc-onefile.js",
    })
);

// oxc - concat
await run("oxc - concat", () =>
    minify({
        compressor: oxc,
        input: ["public/js/sample.js", "public/js/sample2.js"],
        output: "public/js-dist/oxc-concat.js",
    })
);

// UglifyJS - single file
await run("UglifyJS - single file", () =>
    minify({
        compressor: uglifyJs,
        input: "public/js/sample.js",
        output: "public/js-dist/uglify-onefile.js",
    })
);

// UglifyJS - concat
await run("UglifyJS - concat", () =>
    minify({
        compressor: uglifyJs,
        input: ["public/js/sample.js", "public/js/sample2.js"],
        output: "public/js-dist/uglify-concat.js",
    })
);

// UglifyJS - wildcards
await run("UglifyJS - wildcards", () =>
    minify({
        compressor: uglifyJs,
        input: "public/js/**/*.js",
        output: "public/js-dist/uglifyjs-wildcards.js",
    })
);

// No compress - concat
await run("No Compress - concat", () =>
    minify({
        compressor: noCompress,
        input: ["public/js/sample.js", "public/js/sample2.js"],
        output: "public/js-dist/no-compress-concat.js",
    })
);

// No compress - wildcards
await run("No Compress - wildcards", () =>
    minify({
        compressor: noCompress,
        input: "public/js/**/*.js",
        output: "public/js-dist/no-compress-wildcards.js",
    })
);

// ============================================
// CSS Examples
// ============================================

// cssnano - concat
await run("cssnano - concat", () =>
    minify({
        compressor: cssnano,
        input: ["public/css/sample.css", "public/css/sample2.css"],
        output: "public/css-dist/cssnano-concat.css",
    })
);

// csso - concat
await run("csso - concat", () =>
    minify({
        compressor: csso,
        input: ["public/css/sample.css", "public/css/sample2.css"],
        output: "public/css-dist/csso-concat.css",
    })
);

// clean-css - concat with source map
await run("clean-css - concat with sourcemap", () =>
    minify({
        compressor: cleanCss,
        input: ["public/css/sample.css", "public/css/sample2.css"],
        output: "public/css-dist/cleancss-concat.css",
        options: {
            sourceMap: {
                filename: "public/css-dist/cleancss-concat.map",
                url: "public/css-dist/cleancss-concat.map",
            },
        },
    })
);

// esbuild - CSS single file
await run("esbuild - CSS single file", () =>
    minify({
        compressor: esbuild,
        input: "public/css/sample.css",
        output: "public/css-dist/esbuild-onefile.css",
        type: "css",
    })
);

// esbuild - CSS concat
await run("esbuild - CSS concat", () =>
    minify({
        compressor: esbuild,
        input: ["public/css/sample.css", "public/css/sample2.css"],
        output: "public/css-dist/esbuild-concat.css",
        type: "css",
    })
);

// lightningcss - single file
await run("lightningcss - single file", () =>
    minify({
        compressor: lightningCss,
        input: "public/css/sample.css",
        output: "public/css-dist/lightningcss-onefile.css",
    })
);

// lightningcss - concat
await run("lightningcss - concat", () =>
    minify({
        compressor: lightningCss,
        input: ["public/css/sample.css", "public/css/sample2.css"],
        output: "public/css-dist/lightningcss-concat.css",
    })
);

// ============================================
// HTML Examples
// ============================================

const html = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
    </head>
</html>
`;

// HTML Minifier - content (in-memory)
await run("HTML Minifier - content in-memory", () =>
    minify({
        compressor: htmlMinifier,
        content: html,
        options: {
            minifyJS: false,
        },
    })
);

// HTML Minifier - single file
await run("HTML Minifier - single file", () =>
    minify({
        compressor: htmlMinifier,
        input: "public/index.html",
        output: "public/html-dist/index.min.html",
        options: {
            minifyJS: false,
        },
    })
);

// HTML Minifier - wildcards
await run("HTML Minifier - wildcards", () =>
    minify({
        compressor: htmlMinifier,
        publicFolder: "public/html/",
        input: "*.html",
        output: "public/html-dist/html.min.html",
        options: {
            minifyJS: false,
        },
    })
);

// HTML Minifier - $1 pattern
await run("HTML Minifier - $1 pattern", () =>
    minify({
        compressor: htmlMinifier,
        publicFolder: "public/html/",
        input: "*.html",
        output: "$1.min.html",
        options: {
            minifyJS: false,
        },
    })
);

// HTML Minifier - replace in place
await run("HTML Minifier - replace in place", () =>
    minify({
        compressor: htmlMinifier,
        publicFolder: "public/html/",
        input: "**/*.html",
        output: "$1.min.html",
        replaceInPlace: true,
    })
);

// ============================================
// JSON Examples
// ============================================

const json = `
[
  {
    "item1": "item1"
  },
    {
    "item2": "item2"
  }
]
`;

// JSON Minify - content (in-memory)
await run("JSON Minify - content in-memory", () =>
    minify({
        compressor: jsonMinify,
        content: json,
    })
);

// ============================================
// Image Examples
// ============================================

// Sharp - PNG to WebP
await run("Sharp - PNG to WebP", () =>
    minify({
        compressor: sharp,
        input: "public/images/test.png",
        output: "public/images-dist/sharp-webp.webp",
        options: {
            format: "webp",
            quality: 80,
        },
    })
);

// Sharp - PNG to AVIF
await run("Sharp - PNG to AVIF", () =>
    minify({
        compressor: sharp,
        input: "public/images/test.png",
        output: "public/images-dist/sharp-avif.avif",
        options: {
            format: "avif",
            quality: 60,
        },
    })
);

// Sharp - multi-format output
await run("Sharp - multi-format (WebP + AVIF)", () =>
    minify({
        compressor: sharp,
        input: "public/images/test.png",
        output: "public/images-dist/sharp-multi",
        options: {
            formats: ["webp", "avif"],
            quality: 80,
        },
    })
);

// SVGO - optimize SVG
await run("SVGO - optimize SVG", () =>
    minify({
        compressor: svgo,
        input: "public/images/test.svg",
        output: "public/images-dist/svgo-optimized.svg",
    })
);

// SVGO - with custom plugins
await run("SVGO - with custom plugins", () =>
    minify({
        compressor: svgo,
        input: "public/images/test.svg",
        output: "public/images-dist/svgo-custom.svg",
        options: {
            plugins: [
                {
                    name: "preset-default",
                    params: {
                        overrides: {
                            removeViewBox: false,
                        },
                    },
                },
            ],
        },
    })
);

// Imagemin - compress PNG
await run("Imagemin - compress PNG", () =>
    minify({
        compressor: imagemin,
        input: "public/images/test.png",
        output: "public/images-dist/imagemin-compressed.png",
    })
);

console.log("\n✅ All examples completed!");
