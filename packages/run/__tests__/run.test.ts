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
        test("should be OK with YUI and async", (): Promise<void> =>
            new Promise<void>((done) => {
                const command: Command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                    data: 'console.log("foo");',
                    settings: {
                        sync: false,
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
        test("should not be OK with YUI and sync, fake arg", (): Promise<void> =>
            new Promise<void>((done) => {
                const command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js", "--fake"],
                    data: 'console.log("foo");',
                    settings: {
                        sync: false,
                    },
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
        test("should be OK with YUI and sync", (): Promise<void> =>
            new Promise<void>((done) => {
                const command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js"],
                    data: 'console.log("foo");',
                    settings: {
                        sync: true,
                    },
                    callback: () => {
                        expect(spy).toHaveBeenCalled();
                        done();
                    },
                };
                const spy = vi.spyOn(command, "callback");
                runCommandLine(command as unknown as RunCommandLineParams);
            }));
        test("should not be OK with YUI and sync, fake arg", (): Promise<void> =>
            new Promise<void>((done) => {
                const command = {
                    args: ["-jar", "-Xss2048k", jar, "--type", "js", "--fake"],
                    data: 'console.log("foo");',
                    settings: {
                        sync: true,
                    },
                    callback: () => {
                        expect(spy).toHaveBeenCalled();
                        done();
                    },
                };
                const spy = vi.spyOn(command, "callback");
                runCommandLine(command as unknown as RunCommandLineParams);
            }));
    });

    describe("Create sync errors", () => {
        beforeAll(() => {
            const spy = vi.spyOn(childProcess, "spawnSync");
            spy.mockImplementation(() => {
                throw new Error();
            });
        });
        test("should not be OK with YUI and sync", (): Promise<void> =>
            new Promise<void>((done) => {
                const command = {
                    args: [
                        "-jar",
                        "-Xss2048k",
                        "foo.jar",
                        "--type",
                        "js",
                        "--fake",
                    ],
                    data: 'console.log("foo");',
                    settings: {
                        sync: true,
                    },
                    callback: () => {
                        expect(spy).toHaveBeenCalled();
                        done();
                    },
                };
                const spy = vi.spyOn(command, "callback");
                runCommandLine(command as unknown as RunCommandLineParams);
            }));
    });
    afterAll(() => {
        vi.restoreAllMocks();
    });
});
