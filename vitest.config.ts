import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        projects: ["packages/*"],
        reporters: ["default"],
        coverage: {
            reporter: ["text", "json", "html"],
            exclude: [
                "**/dist/**",
                "**/node_modules/**",
                "**/__tests__/**",
                "**/tests/**",
                "**/*.config.ts",
                "**/types/**",
            ],
        },
    },
});
