import { defineProject } from "vitest/config";

export default defineProject({
    test: {
        testTimeout: 60000, // YUI tests can take ~8s
    },
});
