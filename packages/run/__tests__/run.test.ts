/*!
 * node-minify
 * Copyright(c) 2011-2024 Rodolphe Stoclin
 * MIT Licensed
 */

import childProcess from "node:child_process";
import type { Settings } from "@node-minify/types";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { type RunCommandLineParams, runCommandLine } from "../src/index.ts";

const jar = `${__dirname}/../../yui/src/binaries/yuicompressor-2.4.7.jar`;

type Command = {
    args: string[];
    data: string;
    settings: Partial<Settings>;
    callback: (err?: unknown, result?: string) => void;
};

describe("Package: run", () => {
    describe("Base", () => {
        test("should be OK with YUI", (): Promise<void> =>
            new Promise<void>((done) => {
                const command: Command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                    data: 'console.log("foo");',
                    settings: {},
                    callback: (err?: unknown, result?: string) => {
                        expect(spy).toHaveBeenCalled();
                        expect(err).toBeNull();
                        expect(result).toBeDefined();
                        done();
                    },
                };
                const spy = vi.spyOn(command, "callback");
                runCommandLine(command as unknown as RunCommandLineParams);
            }));
        test("should not be OK with YUI, fake arg", (): Promise<void> =>
            new Promise<void>((done) => {
                const command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js", "--fake"],
                    data: 'console.log("foo");',
                    settings: {},
                    callback: (err?: unknown, result?: string) => {
                        expect(spy).toHaveBeenCalled();
                        expect(err).toBeDefined();
                        expect(result).toBeUndefined();
                        done();
                    },
                };
                const spy = vi.spyOn(command, "callback");
                runCommandLine(command as unknown as RunCommandLineParams);
            }));
        test("should handle empty data input", (): Promise<void> =>
            new Promise<void>((done) => {
                const command: Command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                    data: "",
                    settings: {},
                    callback: (err?: unknown, result?: string) => {
                        expect(spy).toHaveBeenCalled();
                        expect(err).toBeNull();
                        expect(result).toBe("");
                        done();
                    },
                };
                const spy = vi.spyOn(command, "callback");
                runCommandLine(command as unknown as RunCommandLineParams);
            }));

        test("should handle maxBuffer setting", (): Promise<void> =>
            new Promise<void>((done) => {
                const command: Command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                    data: 'console.log("foo");',
                    settings: {
                        buffer: 2000 * 1024,
                    },
                    callback: (err?: unknown, result?: string) => {
                        expect(spy).toHaveBeenCalled();
                        expect(err).toBeNull();
                        expect(result).toBeDefined();
                        done();
                    },
                };
                const spy = vi.spyOn(command, "callback");
                runCommandLine(command as unknown as RunCommandLineParams);
            }));
    });

    // describe("Create errors", () => {
    //     beforeAll(() => {
    //         const spy = vi.spyOn(childProcess, "spawn");
    //         spy.mockImplementation(() => {
    //             throw new Error();
    //         });
    //     });
    //     test("should not be OK with YUI", (): Promise<void> =>
    //         new Promise<void>((done, reject) => {
    //             try {
    //                 const command = {
    //                     args: [
    //                         "-jar",
    //                         "-Xss2048k",
    //                         "foo.jar",
    //                         "--type",
    //                         "js",
    //                         "--fake",
    //                     ],
    //                     data: 'console.log("foo");',
    //                     settings: {},
    //                     callback: () => {
    //                         expect(spy).toHaveBeenCalled();
    //                         done();
    //                     },
    //                 };
    //                 const spy = vi.spyOn(command, "callback");
    //                 runCommandLine(command as unknown as RunCommandLineParams);
    //             } catch (error) {
    //                 reject(error);
    //             }
    //         }));
    // });
    afterAll(() => {
        vi.restoreAllMocks();
    });
});
