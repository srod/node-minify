import { mkdir } from "node:fs/promises";
import path from "node:path";
import type { Compressor, Settings } from "@node-minify/types";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("node:fs/promises", () => ({
    mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@node-minify/utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@node-minify/utils")>();
    return {
        ...actual,
        compressSingleFile: vi.fn().mockResolvedValue("ok"),
    };
});

import { compressSingleFile } from "@node-minify/utils";
import { compress } from "../src/compress.ts";

describe("compress path handling", () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    test("should create directory for output paths using backslashes", async () => {
        const compressor: Compressor = async () => ({ code: "ok" });
        const settings: Settings = {
            compressor,
            input: "input.js",
            output: "nested\\dir\\file.min.js",
        };

        await compress(settings);

        expect(vi.mocked(mkdir)).toHaveBeenCalledWith("nested\\dir", {
            recursive: true,
        });
        expect(vi.mocked(compressSingleFile)).toHaveBeenCalledTimes(1);
    });

    test("should preserve dirname separators before mkdir", async () => {
        vi.spyOn(path, "dirname").mockReturnValue("nested\\dir");

        const compressor: Compressor = async () => ({ code: "ok" });
        const settings: Settings = {
            compressor,
            input: "input.js",
            output: "nested\\dir\\file.min.js",
        };

        await compress(settings);

        expect(vi.mocked(mkdir)).toHaveBeenCalledWith("nested\\dir", {
            recursive: true,
        });
        expect(vi.mocked(compressSingleFile)).toHaveBeenCalledTimes(1);
    });

    test("should preserve mixed-separator directory paths", async () => {
        const compressor: Compressor = async () => ({ code: "ok" });
        const settings: Settings = {
            compressor,
            input: "input.js",
            output: "tmp\\sub/out.js",
        };

        await compress(settings);

        expect(vi.mocked(mkdir)).toHaveBeenCalledWith("tmp\\sub", {
            recursive: true,
        });
        expect(vi.mocked(compressSingleFile)).toHaveBeenCalledTimes(1);
    });
});
