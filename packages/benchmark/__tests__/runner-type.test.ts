/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterEach, describe, expect, test, vi } from "vitest";

async function typePassedToMinify(
    file: string,
    type?: "js" | "css" | "html"
): Promise<unknown> {
    vi.resetModules();
    const minify = vi.fn().mockResolvedValue("ok");
    vi.doMock("@node-minify/core", () => ({ minify }));
    const { runIterations } = await import("../src/runner.ts");

    await runIterations(file, vi.fn() as never, "out.tmp", 1, { type });

    const args: { type?: string } | undefined = minify.mock.calls[0]?.[0];
    expect(args).toBeDefined();
    return args?.type;
}

describe("type passed to minify", () => {
    afterEach(() => {
        vi.resetModules();
        vi.doUnmock("@node-minify/core");
    });

    test("an explicit type wins over the file extension", async () => {
        expect(await typePassedToMinify("styles.css", "js")).toBe("js");
    });

    test.each([
        ["app.js", "js"],
        ["app.mjs", "js"],
        ["app.cjs", "js"],
        ["app.jsx", "js"],
        ["APP.JS", "js"],
        ["styles.css", "css"],
        ["index.html", "html"],
        ["index.htm", "html"],
    ])("detects %s as %s when type is omitted", async (file, expected) => {
        expect(await typePassedToMinify(file)).toBe(expected);
    });

    test("passes no type for an unknown extension", async () => {
        expect(await typePassedToMinify("data.json")).toBeUndefined();
        expect(await typePassedToMinify("README")).toBeUndefined();
    });
});
