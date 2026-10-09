/*! node-minify - MIT Licensed */

import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { beforeEach, describe, expect, test } from "vitest";
import { type CommandResult, isPublished, publishAll } from "../publish.ts";

const e404 = JSON.stringify({ error: { code: "E404", summary: "Not found" } });

describe("isPublished", () => {
    test("is true when npm view returns the exact version", () => {
        expect(
            isPublished("11.0.0", { status: 0, stdout: '"11.0.0"', stderr: "" })
        ).toBe(true);
        expect(
            isPublished("11.0.0", {
                status: 0,
                stdout: '[\n  "11.0.0"\n]',
                stderr: "",
            })
        ).toBe(true);
    });

    test("is false when npm view answers E404", () => {
        expect(
            isPublished("11.0.1", { status: 1, stdout: e404, stderr: "" })
        ).toBe(false);
    });

    test("is false when npm view succeeds without the version", () => {
        expect(
            isPublished("11.0.1", { status: 0, stdout: "", stderr: "" })
        ).toBe(false);
    });

    test("throws on any other npm view failure", () => {
        const e403 = JSON.stringify({ error: { code: "E403" } });
        expect(() =>
            isPublished("11.0.1", { status: 1, stdout: e403, stderr: "" })
        ).toThrow(/npm view failed/);
        expect(() =>
            isPublished("11.0.1", {
                status: 1,
                stdout: "",
                stderr: "network down",
            })
        ).toThrow(/network down/);
    });
});

type Call = {
    command: string;
    args: string[];
    cwd?: string;
    manifest?: string;
};

describe("publishAll", () => {
    let packagesDir: string;
    const manifests: Record<string, object> = {
        core: {
            name: "@node-minify/core",
            version: "11.0.1",
            dependencies: { "@node-minify/utils": "workspace:*" },
        },
        utils: { name: "@node-minify/utils", version: "11.0.1" },
    };

    beforeEach(() => {
        packagesDir = mkdtempSync(join(tmpdir(), "publish-test-"));
        for (const [dir, manifest] of Object.entries(manifests)) {
            mkdirSync(join(packagesDir, dir));
            writeFileSync(
                join(packagesDir, dir, "package.json"),
                `${JSON.stringify(manifest, null, 2)}\n`
            );
        }
    });

    const manifestOf = (dir: string) =>
        readFileSync(join(packagesDir, dir, "package.json"), "utf-8");

    /** Fake runner: `onRegistry` lists published dirs, `failPublish` the dir whose publish fails. */
    function fakeRun(onRegistry: string[], failPublish?: string) {
        const calls: Call[] = [];
        const run = (
            command: string,
            args: string[],
            options: { cwd?: string } = {}
        ): CommandResult => {
            const call: Call = { command, args, cwd: options.cwd };
            calls.push(call);
            if (args[0] === "view") {
                const dir = args[1].split("/")[1].split("@")[0];
                return onRegistry.includes(dir)
                    ? { status: 0, stdout: '"11.0.1"', stderr: "" }
                    : { status: 1, stdout: e404, stderr: "" };
            }
            if (args[0] === "publish" && options.cwd) {
                call.manifest = manifestOf(basename(options.cwd));
                if (basename(options.cwd) === failPublish) {
                    return { status: 1, stdout: "", stderr: "" };
                }
            }
            return { status: 0, stdout: "", stderr: "" };
        };
        return { run, calls };
    }

    const options = (run: ReturnType<typeof fakeRun>["run"]) => ({
        packagesDir,
        repoRoot: packagesDir,
        run,
        log: () => {},
    });

    test("creates no tags when every version is already on npm", () => {
        const { run, calls } = fakeRun(["core", "utils"]);
        expect(publishAll(options(run))).toBe(0);
        expect(calls.map((c) => c.args[0])).toEqual(["view", "view"]);
    });

    test("publishes only what is missing, with workspace deps resolved, then tags", () => {
        const before = manifestOf("core");
        const { run, calls } = fakeRun(["utils"]);

        expect(publishAll(options(run))).toBe(1);

        const publishes = calls.filter((c) => c.args[0] === "publish");
        expect(publishes.map((c) => basename(c.cwd ?? ""))).toEqual(["core"]);
        expect(JSON.parse(publishes[0].manifest ?? "{}").dependencies).toEqual({
            "@node-minify/utils": "11.0.1",
        });
        expect(manifestOf("core")).toBe(before);
        expect(calls.at(-1)).toMatchObject({
            command: "changeset",
            args: ["tag"],
        });
    });

    test("stops at a failed publish, restores its package.json and creates no tags", () => {
        const before = manifestOf("core");
        const { run, calls } = fakeRun([], "core");

        expect(() => publishAll(options(run))).toThrow(
            /npm publish @node-minify\/core@11.0.1 failed/
        );

        expect(manifestOf("core")).toBe(before);
        expect(calls.some((c) => basename(c.cwd ?? "") === "utils")).toBe(
            false
        );
        expect(calls.some((c) => c.command === "changeset")).toBe(false);
    });
});
