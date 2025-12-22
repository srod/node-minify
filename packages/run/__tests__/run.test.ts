/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import { afterAll, describe, expect, test, vi } from "vitest";
import { type RunCommandLineParams, runCommandLine } from "../src/index.ts";

const jar = `${__dirname}/../../yui/src/binaries/yuicompressor-2.4.7.jar`;

type Command = {
    args: string[];
    data: string;
};

describe("Package: run", () => {
    describe("Base", () => {
        test("should be OK with YUI", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                data: 'console.log("foo");',
            };

            const result = await runCommandLine(
                command as unknown as RunCommandLineParams
            );
            expect(result).toBeDefined();
        });

        test("should not be OK with YUI, fake arg", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js", "--fake"],
                data: 'console.log("foo");',
            };

            await expect(
                runCommandLine(command as unknown as RunCommandLineParams)
            ).rejects.toThrow();
        });

        test("should handle empty data input", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                data: "",
            };

            const result = await runCommandLine(
                command as unknown as RunCommandLineParams
            );
            expect(result).toBe("");
        });

        test("should minify JavaScript input", async () => {
            const command: Command = {
                args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                data: 'console.log("foo");',
            };

            const result = await runCommandLine(
                command as unknown as RunCommandLineParams
            );
            expect(result).toBeDefined();
        });
    });

    // describe("Create errors", () => {
    //     beforeAll(() => {
    //         const spy = vi.spyOn(childProcess, "spawn");
    //         spy.mockImplementation(() => {
    //             throw new Error();
    //         });
    //     });
    //     test("should not be OK with YUI", async () => {
    //         const command = {
    //             args: [
    //                 "-jar",
    //                 "-Xss2048k",
    //                 "foo.jar",
    //                 "--type",
    //                 "js",
    //                 "--fake",
    //             ],
    //             data: 'console.log("foo");',
    //             settings: {},
    //         };
    //
    //         await expect(runCommandLine(command as unknown as RunCommandLineParams))
    //             .rejects.toThrow();
    //     });
    // });

    afterAll(() => {
        vi.restoreAllMocks();
    });
});
