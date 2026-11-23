/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
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
            // @ts-expect-error testing invalid input: settings is missing required fields
            noCompress({ settings: {}, content: undefined })
        ).resolves.toEqual({ code: "" });
    });

    test("should throw when content is not a string", async () => {
        await expect(
            // @ts-expect-error testing invalid input: settings is missing required fields, content is not a string
            noCompress({ settings: {}, content: 123 })
        ).rejects.toThrow(
            "no-compress failed: content must be a string or Buffer but received number"
        );
    });

    test("should handle Buffer content", async () => {
        const buffer = Buffer.from("buffer content");
        const result = await noCompress({
            // @ts-expect-error testing invalid input: settings is missing required fields
            settings: {},
            content: buffer,
        });
        expect(result.code).toBe("buffer content");
    });
});
