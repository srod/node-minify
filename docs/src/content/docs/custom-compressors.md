---
title: Custom Compressors
description: Learn how to create custom compressors for node-minify or contribute new ones to the core.
---

`node-minify` is designed to be extensible. You can use your own custom compression logic without needing to modify the core library, or you can contribute a new official compressor to the project.

## Creating a Local Compressor

If you want to use a specific tool that isn't supported out of the box, or if you need custom logic for your project, you can pass a function directly to `minify()`.

You do not need to register your compressor anywhere to use it programmatically.

### The Compressor Interface

A compressor is simply a function that accepts `MinifierOptions` and returns a `Promise` resolving to a `CompressorResult`.

```typescript
import type { Compressor, MinifierOptions, CompressorResult } from "@node-minify/types";

export const myCompressor: Compressor = async (
  args: MinifierOptions
): Promise<CompressorResult> => {
  const { settings, content, index } = args;
  // logic here
  return { code: "minified code" };
};
```

### Minimal Example

Here is a simple example that uses `String.prototype.replace` as a "compressor":

```javascript
import { minify } from "@node-minify/core";

const myCustomCompressor = async ({ content }) => {
  // Simple "compression": replace multiple spaces with one
  const minified = content.replace(/\s+/g, " ");
  return { code: minified };
};

await minify({
  compressor: myCustomCompressor,
  content: "const foo =    'bar';",
});
// Output: "const foo = 'bar';"
```

### Handling Options

You can access user-provided options via `settings.options`.

```javascript
const myCompressor = async ({ settings, content }) => {
  const { aggressive } = settings.options || {};
  
  if (aggressive) {
    return { code: content.replace(/\s/g, "") }; // Remove ALL whitespace
  }
  return { code: content.trim() };
};

await minify({
  compressor: myCompressor,
  content: "  foo  ",
  options: { aggressive: true }
});
```

## Contributing to Core

If you are building a generic compressor that would benefit the community, we welcome contributions! Official compressors are published as packages under the `@node-minify` scope (e.g., `@node-minify/terser`).

### 1. Package Structure

Create a new package in `packages/<name>` with the following structure:

```text
packages/my-compressor/
├── src/
│   └── index.ts      # Main export
├── __tests__/        # Tests
├── package.json
└── tsconfig.json
```

Your `index.ts` should export the compressor function.

### 2. Registering for CLI Support

To make your compressor available via the CLI (e.g., `node-minify --compressor my-tool`), you must register it in `packages/cli/src/config.ts`.

Add your compressor to the `AVAILABLE_MINIFIER` array:

```typescript
// packages/cli/src/config.ts
export const AVAILABLE_MINIFIER = [
    // ...
    { name: "my-tool", export: "myTool" },
];
```

*   **name**: The CLI argument (kebab-case).
*   **export**: The named export from your package (camelCase).

### 3. Registering for Benchmark Support

To enable benchmarking for your tool, update `packages/benchmark/src/compressor-loader.ts`.

Add your compressor to the `COMPRESSOR_EXPORTS` object:

```typescript
// packages/benchmark/src/compressor-loader.ts
const COMPRESSOR_EXPORTS: Record<string, string> = {
    // ...
    "my-tool": "myTool",
};
```

### 4. Testing

Add tests in `packages/my-tool/__tests__/`. We use Vitest for testing. You can use the shared test helpers from the root `tests/fixtures.ts` if applicable.

```typescript
import { runOneTest } from "../../../tests/fixtures";
import { myTool } from "../src/index";

describe("my-tool", () => {
    test("should minify javascript", async () => {
        await runOneTest({
            compressor: myTool,
            compressorLabel: "my-tool",
            // ... options
        });
    });
});
```
