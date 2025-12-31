import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        include: ["**/*.integration.test.ts"],
        testTimeout: 60000,
        hookTimeout: 30000,
    },
});
