import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        testTimeout: 60000, // Core tests include GCC which can be slow
    },
});
