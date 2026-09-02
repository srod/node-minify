import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        // The error test resets the module registry and re-imports the
        // compressor, which exceeds the 5s default on Windows runners.
        testTimeout: 30000,
    },
});
