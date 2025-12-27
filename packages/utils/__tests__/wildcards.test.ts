import fg from "fast-glob";
import { afterEach, describe, expect, test, vi } from "vitest";
import { wildcards } from "../src/wildcards.js";

// Mock fast-glob globally
vi.mock("fast-glob", () => {
    return {
        default: {
            globSync: vi.fn(),
            convertPathToPattern: vi.fn((path) => path),
        },
    };
});

describe("wildcards", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should return empty object if no wildcards in string input", () => {
        const result = wildcards("file.js");
        expect(result).toEqual({});
    });

    test("should return object with input array if wildcards exist in string input", () => {
        vi.mocked(fg.globSync).mockReturnValue(["1.js", "2.js"]);

        const result = wildcards("*.js");
        expect(result).toEqual({ input: ["1.js", "2.js"] });
    });

    test("should handle array handling without wildcards", () => {
        const input = ["file1.js", "file2.js"];
        const result = wildcards(input);
        expect(result).toEqual({ input: ["file1.js", "file2.js"] });
    });

    test("should handle array with wildcards", () => {
        vi.mocked(fg.globSync).mockReturnValue([
            "expanded1.js",
            "expanded2.js",
        ]);

        const input = ["*.js"];
        const result = wildcards(input);
        expect(result).toEqual({ input: ["expanded1.js", "expanded2.js"] });
    });

    test("should handle public folder", () => {
        vi.mocked(fg.globSync).mockReturnValue(["public/expanded.js"]);

        const result = wildcards("*.js", "public/");
        expect(result).toEqual({ input: ["public/expanded.js"] });
    });

    test("should handle windows paths", async () => {
        const os = await import("node:os");
        vi.spyOn(os.default, "platform").mockReturnValue("win32");
        vi.mocked(fg.globSync).mockReturnValue(["win\\expanded.js"]);

        const result = wildcards("*.js", "win\\");
        expect(result).toEqual({ input: ["win\\expanded.js"] });
        expect(fg.convertPathToPattern).toHaveBeenCalled();
    });

    test("should handle array with windows paths", async () => {
        const os = await import("node:os");
        vi.spyOn(os.default, "platform").mockReturnValue("win32");
        vi.mocked(fg.globSync).mockReturnValue([
            "win\\expanded1.js",
            "win\\expanded2.js",
        ]);

        const result = wildcards(["*.js"], "win\\");
        expect(result).toEqual({
            input: ["win\\expanded1.js", "win\\expanded2.js"],
        });
        expect(fg.convertPathToPattern).toHaveBeenCalled();
    });

    test("should filter out paths with wildcards if globSync returns them", () => {
        vi.mocked(fg.globSync).mockReturnValue(["*.js", "file.js"]);

        const result = wildcards("*.js");
        expect(result).toEqual({ input: ["file.js"] });
    });

    test("should filter out paths with wildcards in array input", () => {
        vi.mocked(fg.globSync).mockReturnValue(["*.js", "file.js"]);

        const result = wildcards(["*.js"]);
        expect(result).toEqual({ input: ["file.js"] });
    });
});
