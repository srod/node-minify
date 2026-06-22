/*!
 * node-minify
 * Copyright (c) 2011-2026 Rodolphe Stoclin
 * MIT Licensed
 */

declare module "google-closure-compiler" {
    import type { ChildProcess } from "node:child_process";

    export class compiler {
        constructor(
            args:
                | Record<string, string | boolean | Record<string, unknown>>
                | string[]
        );
        commandArguments: string[];
        javaPath: string;
        JAR_PATH: string;
        run(
            callback: (exitCode: number, stdOut: string, stdErr: string) => void
        ): ChildProcess;
    }

    const googleClosureCompiler: {
        compiler: typeof compiler;
    };

    export default googleClosureCompiler;
}
