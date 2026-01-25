/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

import fg from "fast-glob";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { WildcardOptions } from "../src/wildcards.ts";
import { DEFAULT_IGNORES, wildcards } from "../src/wildcards.ts";

// Mock fast-glob globally
vi.mock("fast-glob", () => {
    return {
        default: {
            globSync: vi.fn(),
            convertPathToPattern: vi.fn((path) => path),
        },
    };
});

describe("wildcards with ignore patterns", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should work with string publicFolder (backward compat)", () => {
        vi.mocked(fg.globSync).mockReturnValue(["public/app.js"]);

        const result = wildcards("*.js", "public/");
        expect(result).toEqual({ input: ["public/app.js"] });
        expect(fg.globSync).toHaveBeenCalledWith("public/*.js", {
            ignore: undefined,
        });
    });

    test("should work with object { publicFolder } option", () => {
        vi.mocked(fg.globSync).mockReturnValue(["public/app.js"]);

        const options: WildcardOptions = { publicFolder: "public/" };
        const result = wildcards("*.js", options);
        expect(result).toEqual({ input: ["public/app.js"] });
        expect(fg.globSync).toHaveBeenCalledWith("public/*.js", {
            ignore: undefined,
        });
    });

    test("should exclude files matching ignore patterns", () => {
        vi.mocked(fg.globSync).mockReturnValue(["app.js", "utils.js"]);

        const options: WildcardOptions = {
            ignore: ["**/node_modules/**"],
        };
        const result = wildcards("*.js", options);
        expect(result).toEqual({ input: ["app.js", "utils.js"] });
        expect(fg.globSync).toHaveBeenCalledWith("*.js", {
            ignore: ["**/node_modules/**"],
        });
    });

    test("should work with both publicFolder and ignore in object", () => {
        vi.mocked(fg.globSync).mockReturnValue(["src/app.js"]);

        const options: WildcardOptions = {
            publicFolder: "src/",
            ignore: ["**/*.min.js", "**/dist/**"],
        };
        const result = wildcards("*.js", options);
        expect(result).toEqual({ input: ["src/app.js"] });
        expect(fg.globSync).toHaveBeenCalledWith("src/*.js", {
            ignore: ["**/*.min.js", "**/dist/**"],
        });
    });

    test("should pass ignore to globSync for array input", () => {
        vi.mocked(fg.globSync).mockReturnValue(["a.js", "b.js"]);

        const options: WildcardOptions = {
            ignore: ["**/node_modules/**"],
        };
        const result = wildcards(["*.js", "src/*.js"], options);
        expect(result).toEqual({ input: ["a.js", "b.js"] });
        expect(fg.globSync).toHaveBeenCalledWith(["*.js", "src/*.js"], {
            ignore: ["**/node_modules/**"],
        });
    });

    test("DEFAULT_IGNORES should be exported and contain expected patterns", () => {
        expect(DEFAULT_IGNORES).toBeDefined();
        expect(Array.isArray(DEFAULT_IGNORES)).toBe(true);
        expect(DEFAULT_IGNORES).toContain("**/node_modules/**");
        expect(DEFAULT_IGNORES).toContain("**/dist/**");
        expect(DEFAULT_IGNORES).toContain("**/build/**");
        expect(DEFAULT_IGNORES).toContain("**/.next/**");
        expect(DEFAULT_IGNORES).toContain("**/*.min.{js,css}");
        expect(DEFAULT_IGNORES).toContain("**/*.d.ts");
        expect(DEFAULT_IGNORES).toContain("**/__tests__/**");
        expect(DEFAULT_IGNORES).toContain("**/.*");
    });

    test("should use DEFAULT_IGNORES when no ignore option provided", () => {
        vi.mocked(fg.globSync).mockReturnValue(["app.js"]);

        // Test that we can use DEFAULT_IGNORES explicitly
        const options: WildcardOptions = {
            ignore: DEFAULT_IGNORES,
        };
        const result = wildcards("*.js", options);
        expect(result).toEqual({ input: ["app.js"] });
        expect(fg.globSync).toHaveBeenCalledWith("*.js", {
            ignore: DEFAULT_IGNORES,
        });
    });
});
