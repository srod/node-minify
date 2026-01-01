/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { cleanCss } from "@node-minify/clean-css";
import { minify } from "@node-minify/core";
import { esbuild } from "@node-minify/esbuild";
import { terser } from "@node-minify/terser";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

function generateLargeJS(sizeKB: number): string {
    const functions: string[] = [];
    const targetSize = sizeKB * 1024;

    let i = 0;
    while (functions.join("\n").length < targetSize) {
        functions.push(`
function processValue${i}(value) {
    var result = value * ${i + 1};
    var temp = result + ${i};
    var final = temp - ${i / 2};
    if (final > 100) {
        console.log("Large value detected: " + final);
        return final * 2;
    } else if (final < 0) {
        console.log("Negative value: " + final);
        return Math.abs(final);
    }
    return final;
}
`);
        i++;
    }

    return functions.join("\n");
}

function generateLargeCSS(sizeKB: number): string {
    const rules: string[] = [];
    const targetSize = sizeKB * 1024;

    let i = 0;
    while (rules.join("\n").length < targetSize) {
        rules.push(`
.component-${i} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: ${10 + (i % 20)}px;
    margin: ${5 + (i % 10)}px;
    background-color: #${((i * 123456) % 0xffffff).toString(16).padStart(6, "0")};
    border: 1px solid #${((i * 654321) % 0xffffff).toString(16).padStart(6, "0")};
    border-radius: ${i % 16}px;
    box-shadow: 0 ${i % 4}px ${i % 8}px rgba(0, 0, 0, 0.${i % 5});
    transition: all 0.${i % 5}s ease-in-out;
}
.component-${i}:hover {
    transform: scale(1.0${i % 5});
    opacity: 0.${90 + (i % 10)};
}
.component-${i} .inner-${i} {
    width: ${50 + (i % 50)}%;
    height: auto;
    min-height: ${100 + (i % 100)}px;
}
`);
        i++;
    }

    return rules.join("\n");
}

function getHeapUsedMB(): number {
    if (global.gc) {
        global.gc();
    }
    return process.memoryUsage().heapUsed / 1024 / 1024;
}

function forceGC(): void {
    if (global.gc) {
        global.gc();
        global.gc();
    }
}

describe("Memory Baseline Integration Tests", () => {
    beforeAll(async () => {
        await minify({ compressor: terser, content: "var x = 1;" });
        await minify({ compressor: cleanCss, content: ".a { color: red; }" });
        await minify({
            compressor: esbuild,
            content: "var x = 1;",
            type: "js",
        });
        forceGC();
    });

    afterAll(() => {
        forceGC();
    });

    describe("Large file processing", () => {
        test("should process 100KB JavaScript without excessive memory growth", async () => {
            const largeJS = generateLargeJS(100);
            expect(largeJS.length).toBeGreaterThan(100 * 1024);

            forceGC();
            const heapBefore = getHeapUsedMB();

            const result = await minify({
                compressor: terser,
                content: largeJS,
            });

            forceGC();
            const heapAfter = getHeapUsedMB();

            expect(result).toBeDefined();
            expect((result as string).length).toBeGreaterThan(0);
            expect((result as string).length).toBeLessThan(largeJS.length);

            // Memory threshold: 50MB max growth for 100KB input
            const memoryGrowth = heapAfter - heapBefore;
            expect(memoryGrowth).toBeLessThan(50);
        }, 30000);

        test("should process 100KB CSS without excessive memory growth", async () => {
            const largeCSS = generateLargeCSS(100);
            expect(largeCSS.length).toBeGreaterThan(100 * 1024);

            forceGC();
            const heapBefore = getHeapUsedMB();

            const result = await minify({
                compressor: cleanCss,
                content: largeCSS,
            });

            forceGC();
            const heapAfter = getHeapUsedMB();

            expect(result).toBeDefined();
            expect((result as string).length).toBeGreaterThan(0);
            expect((result as string).length).toBeLessThan(largeCSS.length);

            // Memory threshold: 50MB max growth
            const memoryGrowth = heapAfter - heapBefore;
            expect(memoryGrowth).toBeLessThan(50);
        }, 30000);

        test("should process 500KB JavaScript with esbuild efficiently", async () => {
            const veryLargeJS = generateLargeJS(500);
            expect(veryLargeJS.length).toBeGreaterThan(500 * 1024);

            forceGC();
            const heapBefore = getHeapUsedMB();

            const result = await minify({
                compressor: esbuild,
                content: veryLargeJS,
                type: "js",
            });

            forceGC();
            const heapAfter = getHeapUsedMB();

            expect(result).toBeDefined();
            expect((result as string).length).toBeGreaterThan(0);
            expect((result as string).length).toBeLessThan(veryLargeJS.length);

            // Memory threshold: 100MB max growth for 500KB input
            const memoryGrowth = heapAfter - heapBefore;
            expect(memoryGrowth).toBeLessThan(100);
        }, 60000);
    });

    describe("Sequential processing stability", () => {
        test("should not leak memory across multiple sequential compressions", async () => {
            const jsContent = generateLargeJS(50);
            const iterations = 10;

            forceGC();
            const heapStart = getHeapUsedMB();

            for (let i = 0; i < iterations; i++) {
                await minify({
                    compressor: terser,
                    content: jsContent,
                });
            }

            forceGC();
            const heapEnd = getHeapUsedMB();

            const totalGrowth = heapEnd - heapStart;
            const growthPerIteration = totalGrowth / iterations;

            // Memory threshold: max 5MB average growth per iteration
            expect(growthPerIteration).toBeLessThan(5);
        }, 60000);

        test("should not leak memory across mixed compressor usage", async () => {
            const jsContent = "function test() { var x = 1; return x; }";
            const cssContent = ".test { color: red; margin: 10px; }";
            const iterations = 5;

            forceGC();
            const heapStart = getHeapUsedMB();

            for (let i = 0; i < iterations; i++) {
                await minify({ compressor: terser, content: jsContent });
                await minify({ compressor: cleanCss, content: cssContent });
                await minify({
                    compressor: esbuild,
                    content: jsContent,
                    type: "js",
                });
            }

            forceGC();
            const heapEnd = getHeapUsedMB();

            // Memory threshold: 30MB max for 15 compressions
            const totalGrowth = heapEnd - heapStart;
            expect(totalGrowth).toBeLessThan(30);
        }, 60000);
    });

    describe("Parallel processing stability", () => {
        test("should handle parallel compressions without memory issues", async () => {
            const contents = Array.from({ length: 10 }, () =>
                generateLargeJS(20)
            );

            forceGC();
            const heapBefore = getHeapUsedMB();

            const results = await Promise.all(
                contents.map((content) =>
                    minify({
                        compressor: terser,
                        content,
                    })
                )
            );

            forceGC();
            const heapAfter = getHeapUsedMB();

            expect(results).toHaveLength(10);
            results.forEach((result) => {
                expect(result).toBeDefined();
                expect((result as string).length).toBeGreaterThan(0);
            });

            // Memory threshold: 100MB max for 10 parallel 20KB compressions
            const memoryGrowth = heapAfter - heapBefore;
            expect(memoryGrowth).toBeLessThan(100);
        }, 60000);

        test("should handle parallel mixed compressions", async () => {
            forceGC();
            const heapBefore = getHeapUsedMB();

            const tasks = [
                minify({
                    compressor: terser,
                    content: generateLargeJS(30),
                }),
                minify({
                    compressor: cleanCss,
                    content: generateLargeCSS(30),
                }),
                minify({
                    compressor: esbuild,
                    content: generateLargeJS(30),
                    type: "js",
                }),
                minify({
                    compressor: terser,
                    content: generateLargeJS(30),
                }),
                minify({
                    compressor: cleanCss,
                    content: generateLargeCSS(30),
                }),
            ];

            const results = await Promise.all(tasks);

            forceGC();
            const heapAfter = getHeapUsedMB();

            expect(results).toHaveLength(5);
            results.forEach((result) => {
                expect(result).toBeDefined();
                expect((result as string).length).toBeGreaterThan(0);
            });

            // Memory threshold: 75MB max for 5 parallel 30KB compressions
            const memoryGrowth = heapAfter - heapBefore;
            expect(memoryGrowth).toBeLessThan(75);
        }, 60000);
    });

    describe("Memory cleanup", () => {
        test("should release memory after processing completes", async () => {
            const largeContent = generateLargeJS(200);

            forceGC();
            const heapBefore = getHeapUsedMB();

            const result = await minify({
                compressor: terser,
                content: largeContent,
            });

            expect(result).toBeDefined();

            const heapDuring = getHeapUsedMB();

            forceGC();
            await new Promise((resolve) => setTimeout(resolve, 100));
            forceGC();

            const heapAfter = getHeapUsedMB();

            const growthDuringProcessing = heapDuring - heapBefore;
            const finalGrowth = heapAfter - heapBefore;

            expect(finalGrowth).toBeLessThanOrEqual(
                growthDuringProcessing + 10
            );
        }, 30000);

        test("should handle repeated large allocations", async () => {
            const iterations = 3;
            const heapMeasurements: number[] = [];

            forceGC();
            heapMeasurements.push(getHeapUsedMB());

            for (let i = 0; i < iterations; i++) {
                const largeContent = generateLargeJS(100);
                await minify({
                    compressor: terser,
                    content: largeContent,
                });
                forceGC();
                heapMeasurements.push(getHeapUsedMB());
            }

            const firstGrowth =
                (heapMeasurements[1] ?? 0) - (heapMeasurements[0] ?? 0);
            const lastGrowth =
                (heapMeasurements[iterations] ?? 0) -
                (heapMeasurements[iterations - 1] ?? 0);

            // Memory threshold: later iterations should not grow more than initial + 20MB
            expect(lastGrowth).toBeLessThan(firstGrowth + 20);
        }, 60000);
    });

    describe("Stress tests", () => {
        test("should survive rapid sequential compressions", async () => {
            const smallContent = "var x = 1; var y = 2; var z = x + y;";
            const iterations = 50;

            forceGC();
            const heapBefore = getHeapUsedMB();

            for (let i = 0; i < iterations; i++) {
                await minify({
                    compressor: terser,
                    content: smallContent,
                });
            }

            forceGC();
            const heapAfter = getHeapUsedMB();

            // Memory threshold: 25MB max for 50 small compressions
            const memoryGrowth = heapAfter - heapBefore;
            expect(memoryGrowth).toBeLessThan(25);
        }, 30000);

        test("should handle burst of parallel requests", async () => {
            const content = generateLargeJS(10);
            const burstSize = 20;

            forceGC();
            const heapBefore = getHeapUsedMB();

            const tasks = Array.from({ length: burstSize }, () =>
                minify({
                    compressor: esbuild,
                    content,
                    type: "js",
                })
            );

            const results = await Promise.all(tasks);

            forceGC();
            const heapAfter = getHeapUsedMB();

            expect(results).toHaveLength(burstSize);
            results.forEach((result) => {
                expect(result).toBeDefined();
            });

            // Memory threshold: 150MB max for burst of 20 parallel compressions
            const memoryGrowth = heapAfter - heapBefore;
            expect(memoryGrowth).toBeLessThan(150);
        }, 60000);
    });
});
