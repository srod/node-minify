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

    describe("Windows path edge cases", () => {
        test("should handle UNC paths", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "\\\\server\\share\\file.js",
            ]);

            const result = wildcards("*.js", "\\\\server\\share\\");
            expect(result).toEqual({ input: ["\\\\server\\share\\file.js"] });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should handle absolute Windows paths with drive letter", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "C:\\Users\\test\\file.js",
            ]);

            const result = wildcards("*.js", "C:\\Users\\test\\");
            expect(result).toEqual({ input: ["C:\\Users\\test\\file.js"] });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should handle mixed slashes in Windows paths", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.convertPathToPattern).mockImplementation((path) =>
                path.replace(/\\/g, "/")
            );
            vi.mocked(fg.globSync).mockReturnValue(["win/mixed/file.js"]);

            const result = wildcards("*.js", "win\\mixed/");
            expect(result).toEqual({ input: ["win/mixed/file.js"] });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should handle Windows paths with spaces", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "C:\\Program Files\\app\\file.js",
            ]);

            const result = wildcards("*.js", "C:\\Program Files\\app\\");
            expect(result).toEqual({
                input: ["C:\\Program Files\\app\\file.js"],
            });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should handle Windows paths with special characters", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "C:\\Users\\test (1)\\file.js",
            ]);

            const result = wildcards("*.js", "C:\\Users\\test (1)\\");
            expect(result).toEqual({
                input: ["C:\\Users\\test (1)\\file.js"],
            });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should handle multiple Windows paths in array", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "C:\\src\\app.js",
                "D:\\lib\\utils.js",
            ]);

            const result = wildcards(["C:\\src\\*.js", "D:\\lib\\*.js"]);
            expect(result).toEqual({
                input: ["C:\\src\\app.js", "D:\\lib\\utils.js"],
            });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should handle Windows paths without wildcards", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");

            const result = wildcards("C:\\src\\file.js");
            expect(result).toEqual({});
        });

        test("should handle Windows paths with nested wildcards", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "C:\\src\\nested\\deep\\file.js",
                "C:\\src\\nested\\other\\file.js",
            ]);

            const result = wildcards("**\\*.js", "C:\\src\\");
            expect(result).toEqual({
                input: [
                    "C:\\src\\nested\\deep\\file.js",
                    "C:\\src\\nested\\other\\file.js",
                ],
            });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should handle Windows relative paths", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "..\\src\\file.js",
                "..\\lib\\file.js",
            ]);

            const result = wildcards("..\\**\\*.js");
            expect(result).toEqual({
                input: ["..\\src\\file.js", "..\\lib\\file.js"],
            });
            expect(fg.convertPathToPattern).toHaveBeenCalled();
        });

        test("should filter wildcards from Windows glob results", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([
                "*.js",
                "C:\\src\\file.js",
                "**\\test.js",
            ]);

            const result = wildcards("*.js", "C:\\src\\");
            expect(result).toEqual({ input: ["C:\\src\\file.js"] });
        });

        test("should handle array with only non-wildcard Windows paths", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");

            const input = ["C:\\src\\file1.js", "D:\\lib\\file2.js"];
            const result = wildcards(input);
            expect(result).toEqual({
                input: ["C:\\src\\file1.js", "D:\\lib\\file2.js"],
            });
        });

        test("should handle empty results from Windows glob", async () => {
            const os = await import("node:os");
            vi.spyOn(os.default, "platform").mockReturnValue("win32");
            vi.mocked(fg.globSync).mockReturnValue([]);

            const result = wildcards("*.js", "C:\\empty\\");
            expect(result).toEqual({ input: [] });
        });
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
