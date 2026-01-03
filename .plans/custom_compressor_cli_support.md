# Plan: Enable CLI & Benchmark Support for Custom Compressors

## Objective
Allow developers to use custom compressors (external packages or local files) with the `node-minify` CLI and Benchmark tools, without requiring them to be hardcoded in the core repository's registry files.

---

## Status: NOT IMPLEMENTED

This is a future enhancement proposal. The plan has been reviewed and enhanced with additional considerations.

---

## Problem
Currently, the CLI and Benchmark tools rely on static arrays/objects (`AVAILABLE_MINIFIER` in `packages/cli/src/config.ts` and `COMPRESSOR_EXPORTS` in `packages/benchmark/src/compressor-loader.ts`) to map a string name (e.g., "terser") to a package import. This prevents users from using their own compressors via the command line, e.g., `node-minify --compressor my-custom-compressor`.

## Proposed Solution
Modify the CLI and Benchmark tools to support dynamic resolution of compressor names.

### 1. CLI Logic Update (`packages/cli/src/index.ts`)
Current logic:
1.  Look up name in `AVAILABLE_MINIFIER`.
2.  If found, dynamic import `@node-minify/<name>`.

New logic:
1.  Look up name in `AVAILABLE_MINIFIER`.
2.  If found, use the standard logic (import `@node-minify/<name>`).
3.  **If NOT found**:
    *   Attempt to dynamic import the name directly (e.g., `import("my-custom-pkg")`).
    *   If that fails, attempt to resolve it relative to the current working directory (for local files).
    *   Expect the module to export a compressor function (default export or matching name).

### 2. Benchmark Logic Update (`packages/benchmark/src/compressor-loader.ts`)
Current logic:
1.  Look up name in `COMPRESSOR_EXPORTS`.
2.  Import `@node-minify/<name>`.

New logic:
1.  Similar fallback strategy as the CLI.
2.  If the known export map fails, try importing the package/file directly.

## Implementation Details

### Step 1: Update CLI (`packages/cli`)
*   **File**: `packages/cli/src/index.ts` (function `runOne`, lines 38-94)
*   **Change**: Refactor the "Find compressor" block (lines 40-46).
    *   If `minifierDefinition` is missing, do NOT throw immediately.
    *   Instead, try to load the module using the provided string.
    *   Check for exports in this priority order:
        1.  Named export matching camelCase of package name (e.g., `myTool` from `my-tool`)
        2.  Named export `compressor`
        3.  Default export
        4.  First function export

### Step 2: Update Benchmark (`packages/benchmark`)
*   **File**: `packages/benchmark/src/compressor-loader.ts` (function `loadCompressor`, lines 33-45)
*   **Change**: Refactor to support arbitrary package names.
    *   If `COMPRESSOR_EXPORTS[name]` is undefined, assume the package name is the CLI argument.
    *   Try `import(name)`.
    *   Fallback to `mod.default`.

### Step 3: Update Documentation
*   Update `docs/src/content/docs/custom-compressors.md` to explain how to use this new feature.
    *   Example: `node-minify --compressor my-published-package ...`
    *   Example: `node-minify --compressor ./local-compressor.js ...`

### Step 4: Update CLI Help Text
*   Update `--compressor` option description:
    ```
    --compressor <name>  Built-in compressor name, npm package, or path to local file
    ```

## Risks & Considerations
*   **Security**: dynamically importing arbitrary strings from CLI arguments can be risky if inputs aren't sanitized, but in a CLI tool context, the user is already executing code they control. We should ensure we handle import errors gracefully.
*   **ESM vs CJS**: We are using `import()`, which should handle both in modern Node/Bun environments, but we need to ensure local file paths are absolute or properly formatted for `import()` (e.g., `file://...`).

---

## Additional Considerations (Added During Review)

### TypeScript Type Changes
The current type in `packages/cli/src/index.ts` (line 16-18):
```typescript
export type SettingsWithCompressor = Omit<Settings, "compressor"> & {
    compressor: (typeof AVAILABLE_MINIFIER)[number]["name"];
};
```
After allowing arbitrary strings, this needs to become:
```typescript
export type SettingsWithCompressor = Omit<Settings, "compressor"> & {
    compressor: string;
};
```

### File URL Handling for Local Paths
For local file resolution, use proper `file://` URL format:
```typescript
import path from "node:path";

async function resolveCompressor(name: string) {
    // Try known compressors first
    const known = AVAILABLE_MINIFIER.find(c => c.name === name);
    if (known) {
        return import(`@node-minify/${name}`);
    }
    
    // Try as npm package
    try {
        return await import(name);
    } catch {
        // Try as local file
        const isLocalPath = name.startsWith('./') || name.startsWith('/') || name.startsWith('../');
        if (isLocalPath) {
            const absolutePath = path.resolve(process.cwd(), name);
            const fileUrl = new URL(`file://${absolutePath}`).href;
            return await import(fileUrl);
        }
        throw new Error(`Could not resolve compressor '${name}'. Is it installed?`);
    }
}
```

### Error Messages
Add specific error messages for different failure modes:
- Package not found: `"Could not resolve compressor '{name}'. Is it installed?"`
- No valid export: `"Package '{name}' doesn't export a valid compressor function. Expected a function as default export or named export 'compressor'."`
- Invalid return type: `"Compressor '{name}' returned invalid result. Expected { code: string }."`

### Compressor Return Validation
Add runtime validation that the dynamically loaded function returns a proper `CompressorResult`:
```typescript
function validateCompressorResult(result: unknown, name: string): asserts result is CompressorResult {
    if (!result || typeof result !== 'object') {
        throw new Error(`Compressor '${name}' returned invalid result`);
    }
    if (!('code' in result) || typeof (result as any).code !== 'string') {
        throw new Error(`Compressor '${name}' must return { code: string }`);
    }
}
```

### Registry Deduplication
Consider extracting shared resolution logic to avoid duplication between:
- `packages/cli/src/config.ts` (`AVAILABLE_MINIFIER`)
- `packages/benchmark/src/compressor-loader.ts` (`COMPRESSOR_EXPORTS`)

Possible shared utility in `@node-minify/utils`:
```typescript
// packages/utils/src/compressor-resolver.ts
export async function resolveCompressor(name: string): Promise<Compressor>
```

---

## Test Cases

### Required Tests
1.  **Built-in compressor**: `node-minify --compressor terser` (existing behavior)
2.  **Published npm package**: `node-minify --compressor my-custom-compressor`
3.  **Local relative path**: `node-minify --compressor ./compressor.js`
4.  **Local absolute path**: `node-minify --compressor /path/to/compressor.js`
5.  **Invalid package**: Should fail gracefully with helpful error
6.  **Package without valid export**: Should fail with clear message about expected exports
7.  **Compressor returns invalid result**: Should fail with validation error

### Test File Template
```javascript
// test-compressor.js
export default async function({ content }) {
    return { code: content.replace(/\s+/g, ' ') };
}
```

---

## Verification
*   Create a temporary local compressor file.
*   Run the CLI pointing to it.
*   Verify it executes.
*   Run benchmark with custom compressor.
*   Verify error messages for failure cases.
