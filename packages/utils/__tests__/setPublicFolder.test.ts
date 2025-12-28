import path from "node:path";
import { describe, expect, test } from "vitest";
import { setPublicFolder } from "../src/setPublicFolder.js";

describe("setPublicFolder", () => {
    test("should return empty object if publicFolder is not a string", () => {
        // @ts-expect-error testing invalid input
        const result = setPublicFolder("file.js", null);
        expect(result).toEqual({});
    });

    test("should prepend public folder to string input", () => {
        const result = setPublicFolder("file.js", "public/");
        expect(result).toEqual({ input: path.normalize("public/file.js") });
    });

    test("should prepend public folder to array input", () => {
        const result = setPublicFolder(["file1.js", "file2.js"], "public/");
        expect(result).toEqual({
            input: [
                path.normalize("public/file1.js"),
                path.normalize("public/file2.js"),
            ],
        });
    });

    test("should not prepend if already present in string input", () => {
        const result = setPublicFolder("public/file.js", "public/");
        expect(result).toEqual({ input: path.normalize("public/file.js") });
    });

    test("should not prepend if already present in array input", () => {
        const result = setPublicFolder(
            ["public/file1.js", "file2.js"],
            "public/"
        );
        expect(result).toEqual({
            input: [
                path.normalize("public/file1.js"),
                path.normalize("public/file2.js"),
            ],
        });
    });
});
