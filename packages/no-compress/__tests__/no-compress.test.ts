/*!
 * node-minify
 * Copyright(c) 2011-2025 Rodolphe Stoclin
 * MIT Licensed
 */

import { describe, expect, test } from "vitest";
import { runOneTest, tests } from "../../../tests/fixtures.ts";
import { noCompress } from "../src/index.ts";

const compressorLabel = "no-compress";
const compressor = noCompress;

describe("Package: no-compress", async () => {
    if (!tests.concat) {
        throw new Error("Tests not found");
    }

    for (const options of tests.concat) {
        await runOneTest({ options, compressorLabel, compressor });
    }

    test("should return empty string when content is undefined", async () => {
        await expect(
            noCompress({ settings: {} as any, content: undefined })
        ).resolves.toEqual({ code: "" });
    });

    test("should throw when content is not a string", async () => {
        await expect(
            noCompress({ settings: {} as any, content: 123 as any })
        ).rejects.toThrow(
            "no-compress failed: content must be a string or Buffer but received number"
        );
    });

    test("should handle Buffer content", async () => {
        const buffer = Buffer.from("buffer content");
        const result = await noCompress({
            settings: {} as any,
            content: buffer,
        });
        expect(result.code).toBe("buffer content");
    });
});
