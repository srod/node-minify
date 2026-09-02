/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, describe, expect, test, vi } from "vitest";

describe("runWarmup", () => {
    afterEach(() => {
        vi.resetModules();
        vi.doUnmock("@node-minify/core");
    });

    test("uses a distinct output path for each warmup iteration", async () => {
        const minify = vi.fn().mockResolvedValue("ok");

        vi.doMock("@node-minify/core", () => ({
            minify,
        }));

        const { runWarmup } = await import("../src/runner.ts");

        const warmupFiles = await runWarmup(
            "fixture.js",
            vi.fn() as never,
            "fixture.js.warmup.tmp",
            2,
            {}
        );

        expect(minify).toHaveBeenCalledTimes(2);

        const outputs = minify.mock.calls.map(
            ([args]) => (args as { output: string }).output
        );

        expect(new Set(outputs).size).toBe(2);
        // The returned paths are exactly the outputs passed to minify.
        expect(warmupFiles).toEqual(outputs);
    });

    test("tracks partial warmup paths for cleanup when minify throws mid-loop", async () => {
        const minify = vi
            .fn()
            .mockResolvedValueOnce("ok")
            .mockRejectedValueOnce(new Error("boom"));

        vi.doMock("@node-minify/core", () => ({ minify }));

        const { runWarmup } = await import("../src/runner.ts");

        const collected: string[] = [];
        await expect(
            runWarmup(
                "fixture.js",
                vi.fn() as never,
                "fixture.js.warmup.tmp",
                3,
                {},
                collected
            )
        ).rejects.toThrow("boom");

        // Both attempted iterations (the successful first and the failing
        // second) registered their paths so the caller can delete them.
        expect(collected).toEqual([
            "fixture.js.warmup.tmp.1",
            "fixture.js.warmup.tmp.2",
        ]);
    });
});
