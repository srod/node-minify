import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        reporters: "dot",
        coverage: {
            reporter: ["text", "json", "html"],
        },
        testTimeout: 60000,
    },
});
