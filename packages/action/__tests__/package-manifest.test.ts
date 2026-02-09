import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

interface PackageJson {
    dependencies?: Record<string, string>;
}

describe("package manifest", () => {
    test("declares fast-glob as a direct dependency", () => {
        const packageJsonRaw = readFileSync(
            new URL("../package.json", import.meta.url),
            "utf8"
        );
        const packageJson: PackageJson = JSON.parse(packageJsonRaw);

        expect(packageJson.dependencies?.["fast-glob"]).toBe("^3.3.3");
    });
});
