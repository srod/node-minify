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

        await runWarmup(
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
    });
});
