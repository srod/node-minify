/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cleanCss } from "@node-minify/clean-css";
import { minify } from "@node-minify/core";
import { esbuild } from "@node-minify/esbuild";
import { htmlMinifier } from "@node-minify/html-minifier";
import { jsonMinify } from "@node-minify/jsonminify";
import { terser } from "@node-minify/terser";
import { afterEach, describe, expect, test } from "vitest";
import { createTempFixtures, type TempFixtures } from "./helpers.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Edge Cases Integration Tests", () => {
    let fixtures: TempFixtures;

    afterEach(async () => {
        if (fixtures) {
            await fixtures.cleanup();
        }
    });

    describe("Unicode content handling", () => {
        test("should preserve emoji in JavaScript strings", async () => {
            const jsWithEmoji = `
function greet(name) {
    const greeting = "Hello " + name + " 👋🎉🚀";
    console.log("Status: ✅ Success");
    return greeting;
}
const msg = greet("World 🌍");
`;
            const result = await minify({
                compressor: terser,
                content: jsWithEmoji,
            });

            expect(result).toContain("👋");
            expect(result).toContain("🎉");
            expect(result).toContain("🚀");
            expect(result).toContain("✅");
            expect(result).toContain("🌍");
        });

        test("should preserve CJK characters in JavaScript", async () => {
            const jsWithCJK = `
const messages = {
    japanese: "こんにちは世界",
    chinese: "你好世界",
    korean: "안녕하세요"
};
function getMessage(lang) {
    return messages[lang] || "Hello";
}
`;
            const result = await minify({
                compressor: terser,
                content: jsWithCJK,
            });

            expect(result).toContain("こんにちは世界");
            expect(result).toContain("你好世界");
            expect(result).toContain("안녕하세요");
        });

        test("should preserve RTL text in JavaScript", async () => {
            const jsWithRTL = `
const translations = {
    arabic: "مرحبا بالعالم",
    hebrew: "שלום עולם"
};
`;
            const result = await minify({
                compressor: terser,
                content: jsWithRTL,
            });

            expect(result).toContain("مرحبا بالعالم");
            expect(result).toContain("שלום עולם");
        });

        test("should preserve unicode in CSS selectors and content", async () => {
            const cssWithUnicode = `
.日本語 {
    content: "こんにちは";
    font-family: "游ゴシック";
}
.emoji-icon::before {
    content: "🎨";
}
.chinese-class {
    content: "中文内容";
}
`;
            const result = await minify({
                compressor: cleanCss,
                content: cssWithUnicode,
            });

            expect(result).toContain("日本語");
            expect(result).toContain("こんにちは");
            expect(result).toContain("🎨");
            expect(result).toContain("中文内容");
        });

        test("should preserve unicode in HTML content", async () => {
            const htmlWithUnicode = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>日本語ページ 🎌</title>
</head>
<body>
    <h1>こんにちは世界 👋</h1>
    <p>これは日本語のテストです。</p>
    <p>Chinese: 你好世界</p>
    <p>Korean: 안녕하세요</p>
    <p>Arabic: مرحبا</p>
</body>
</html>
`;
            const result = await minify({
                compressor: htmlMinifier,
                content: htmlWithUnicode,
            });

            expect(result).toContain("日本語ページ");
            expect(result).toContain("🎌");
            expect(result).toContain("こんにちは世界");
            expect(result).toContain("👋");
            expect(result).toContain("你好世界");
            expect(result).toContain("안녕하세요");
            expect(result).toContain("مرحبا");
        });

        test("should preserve unicode in JSON keys and values", async () => {
            const jsonWithUnicode = `{
    "greeting_ja": "こんにちは",
    "greeting_zh": "你好",
    "greeting_ko": "안녕하세요",
    "emoji": "🎉🎊🎈",
    "日本語キー": "Japanese key",
    "中文键": "Chinese key"
}`;
            const result = await minify({
                compressor: jsonMinify,
                content: jsonWithUnicode,
            });

            expect(result).toContain("こんにちは");
            expect(result).toContain("你好");
            expect(result).toContain("안녕하세요");
            expect(result).toContain("🎉🎊🎈");
            expect(result).toContain("日本語キー");
            expect(result).toContain("中文键");
        });

        test("should handle mixed unicode and ASCII in JavaScript", async () => {
            const mixedContent = `
const config = {
    title: "App Title アプリ 🚀",
    description: "A mix of English and 日本語 with emoji 😀",
    keywords: ["test", "テスト", "测试"]
};
`;
            const result = await minify({
                compressor: terser,
                content: mixedContent,
            });

            expect(result).toContain("アプリ");
            expect(result).toContain("🚀");
            expect(result).toContain("日本語");
            expect(result).toContain("😀");
            expect(result).toContain("テスト");
            expect(result).toContain("测试");
        });

        test("should preserve unicode when writing to file", async () => {
            fixtures = await createTempFixtures({
                "unicode.js": `const msg = "Hello 世界 🌍";`,
            });

            await minify({
                compressor: terser,
                input: path.join(fixtures.dir, "unicode.js"),
                output: path.join(fixtures.dir, "unicode.min.js"),
            });

            const output = await fs.readFile(
                path.join(fixtures.dir, "unicode.min.js"),
                "utf-8"
            );
            expect(output).toContain("世界");
            expect(output).toContain("🌍");
        });
    });

    describe("Compression ratio assertions", () => {
        const verboseJS = `
/**
 * This is a very verbose JavaScript file with lots of comments
 * that should be removed during minification.
 * 
 * The purpose of this file is to test that compressors achieve
 * a reasonable compression ratio on typical source code.
 */

// Function to calculate the sum of an array
function calculateSum(numbers) {
    // Initialize the sum variable
    var sum = 0;
    
    // Loop through each number
    for (var i = 0; i < numbers.length; i++) {
        // Add the current number to the sum
        sum = sum + numbers[i];
    }
    
    // Return the final sum
    return sum;
}

// Function to calculate the average
function calculateAverage(numbers) {
    // First get the sum
    var total = calculateSum(numbers);
    
    // Then divide by the count
    var average = total / numbers.length;
    
    // Return the average
    return average;
}

// Function to find the maximum value
function findMaximum(numbers) {
    // Start with the first number
    var max = numbers[0];
    
    // Check each subsequent number
    for (var i = 1; i < numbers.length; i++) {
        // If this number is larger, update max
        if (numbers[i] > max) {
            max = numbers[i];
        }
    }
    
    // Return the maximum
    return max;
}

// Function to find the minimum value
function findMinimum(numbers) {
    // Start with the first number
    var min = numbers[0];
    
    // Check each subsequent number
    for (var i = 1; i < numbers.length; i++) {
        // If this number is smaller, update min
        if (numbers[i] < min) {
            min = numbers[i];
        }
    }
    
    // Return the minimum
    return min;
}

// Export the functions
var MathUtils = {
    sum: calculateSum,
    average: calculateAverage,
    max: findMaximum,
    min: findMinimum
};
`;

        const verboseCSS = `
/**
 * Main stylesheet with verbose formatting
 * Contains styles for the entire application
 */

/* Reset styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Body styles */
body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #333333;
    background-color: #ffffff;
}

/* Container styles */
.container {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 20px;
    padding-right: 20px;
}

/* Header styles */
.header {
    background-color: #f8f9fa;
    padding-top: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #dee2e6;
}

/* Navigation styles */
.navigation {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

/* Button styles */
.button {
    display: inline-block;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 20px;
    padding-right: 20px;
    background-color: #007bff;
    color: #ffffff;
    text-decoration: none;
    border-radius: 4px;
    border: none;
    cursor: pointer;
}

.button:hover {
    background-color: #0056b3;
}

/* Card styles */
.card {
    background-color: #ffffff;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
`;

        test("should achieve at least 40% compression on verbose JavaScript", async () => {
            const result = await minify({
                compressor: terser,
                content: verboseJS,
            });

            const originalSize = verboseJS.length;
            const minifiedSize = (result as string).length;
            const compressionRatio =
                ((originalSize - minifiedSize) / originalSize) * 100;

            expect(compressionRatio).toBeGreaterThanOrEqual(40);
            expect(minifiedSize).toBeLessThan(originalSize * 0.6);
        });

        test("should achieve at least 30% compression on verbose CSS", async () => {
            const result = await minify({
                compressor: cleanCss,
                content: verboseCSS,
            });

            const originalSize = verboseCSS.length;
            const minifiedSize = (result as string).length;
            const compressionRatio =
                ((originalSize - minifiedSize) / originalSize) * 100;

            expect(compressionRatio).toBeGreaterThanOrEqual(30);
            expect(minifiedSize).toBeLessThan(originalSize * 0.7);
        });

        test("should achieve similar compression with esbuild as terser", async () => {
            const terserResult = await minify({
                compressor: terser,
                content: verboseJS,
            });

            const esbuildResult = await minify({
                compressor: esbuild,
                content: verboseJS,
                type: "js",
            });

            const terserSize = (terserResult as string).length;
            const esbuildSize = (esbuildResult as string).length;

            expect(esbuildSize).toBeLessThan(verboseJS.length * 0.6);
            expect(Math.abs(terserSize - esbuildSize)).toBeLessThan(
                verboseJS.length * 0.15
            );
        });

        test("should not increase file size for already minified content", async () => {
            const alreadyMinified = `function a(n){for(var s=0,i=0;i<n.length;i++)s+=n[i];return s}`;

            const result = await minify({
                compressor: terser,
                content: alreadyMinified,
            });

            expect((result as string).length).toBeLessThanOrEqual(
                alreadyMinified.length * 1.05
            );
        });

        test("should handle whitespace-heavy content efficiently", async () => {
            const whitespaceHeavy = `
            
            
            function    test   (   )   {
                
                
                var     x    =    1   ;
                
                
                return    x   ;
                
                
            }
            
            
`;
            const result = await minify({
                compressor: terser,
                content: whitespaceHeavy,
            });

            expect((result as string).length).toBeLessThan(
                whitespaceHeavy.length * 0.3
            );
        });
    });

    describe("Special characters and escaping", () => {
        test("should preserve escaped characters in strings", async () => {
            const jsWithEscapes = `
const str = "Line 1\\nLine 2\\tTabbed";
const path = "C:\\\\Users\\\\test";
const quote = "She said \\"Hello\\"";
`;
            const result = await minify({
                compressor: terser,
                content: jsWithEscapes,
            });

            expect(result).toContain("\\n");
            expect(result).toContain("\\t");
        });

        test("should handle regex with special characters", async () => {
            const jsWithRegex = `
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\\+?[1-9]\\d{1,14}$/;
const urlRegex = /https?:\\/\\/[^\\s]+/g;
`;
            const result = await minify({
                compressor: terser,
                content: jsWithRegex,
            });

            expect(result).toContain("@");
            expect(result).toContain("https?");
        });

        test("should preserve template literals with expressions", async () => {
            const jsWithTemplateLiterals = `
const name = "World";
const greeting = \`Hello \${name}! 👋\`;
const multiline = \`
  First line
  Second line
\`;
`;
            const result = await minify({
                compressor: terser,
                content: jsWithTemplateLiterals,
            });

            expect(result).toContain("${");
            expect(result).toContain("👋");
        });
    });

    describe("Edge case inputs", () => {
        test("should handle minimal valid input", async () => {
            const result = await minify({
                compressor: terser,
                content: "var x=1;",
            });

            expect(result).toBeDefined();
            expect((result as string).length).toBeGreaterThan(0);
        });

        test("should handle input with only whitespace and comments", async () => {
            const onlyCommentsAndWhitespace = `
// Just a comment
/* Another comment */
   
`;
            const result = await minify({
                compressor: terser,
                content: onlyCommentsAndWhitespace,
            });

            expect((result as string).trim().length).toBeLessThanOrEqual(1);
        });

        test("should handle very long single line", async () => {
            const longString = "a".repeat(5000);
            const longLine = `var x = "${longString}";`;

            const result = await minify({
                compressor: terser,
                content: longLine,
            });

            expect(result).toBeDefined();
            expect((result as string).length).toBeGreaterThan(0);
            expect(result).toContain(longString);
        });

        test("should handle deeply nested structures", async () => {
            const deeplyNested = `
var obj = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: {
                            value: 42
                        }
                    }
                }
            }
        }
    }
};
`;
            const result = await minify({
                compressor: terser,
                content: deeplyNested,
            });

            expect(result).toContain("42");
            expect((result as string).length).toBeLessThan(deeplyNested.length);
        });
    });
});
