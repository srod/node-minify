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
}
