---
title: Custom Compressors
description: Learn how to create custom compressors for node-minify and use them with the CLI, Benchmark, and programmatic API.
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

## Using Custom Compressors with CLI

You can use custom compressors directly with the CLI without registering them. The CLI accepts:

- **Built-in compressor names**: e.g., `terser`, `esbuild`
- **npm package names**: e.g., `my-custom-compressor`
- **Local file paths**: e.g., `./my-compressor.js`

### Using an npm Package

First, install your custom compressor package:

```bash
npm install my-custom-compressor
```

Then use it with the CLI:

```bash
node-minify --compressor my-custom-compressor --input src/app.js --output dist/app.min.js
```

### Using a Local File

Create a local compressor file with a default export:

```javascript
// ./my-compressor.js
export default async function({ content }) {
  return { code: content.replace(/\s+/g, ' ') };
}
```

Then use it with the CLI:

```bash
node-minify --compressor ./my-compressor.js --input src/app.js --output dist/app.min.js
```

### Export Resolution

The CLI looks for exports in this order:

1. Known export name (for built-in compressors)
2. Named export matching camelCase of package name (e.g., `myTool` for `my-tool`)
3. Named export `compressor`
4. Default export
5. First function export

## Using Custom Compressors with Benchmark

The benchmark tool also supports custom compressors:

```bash
node-minify benchmark src/app.js --compressors terser,./my-compressor.js,my-custom-package
```

This allows you to compare your custom compressor against built-in ones.

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

### 3. Registering for Resolution (Benchmark & Core)

To enable proper resolution for your tool (used by Benchmark and CLI internals), update `packages/utils/src/compressor-resolver.ts`.

Add your compressor to the `KNOWN_COMPRESSOR_EXPORTS` object:

```typescript
// packages/utils/src/compressor-resolver.ts
const KNOWN_COMPRESSOR_EXPORTS: Record<string, string> = {
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
