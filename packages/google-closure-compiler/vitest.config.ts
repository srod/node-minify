import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        testTimeout: 60000, // GCC tests can take ~30s
    },
});
