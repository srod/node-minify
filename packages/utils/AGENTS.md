# packages/utils/AGENTS.md

Cross-cutting utilities shared by all packages. **Multi-file build.**

## Build (Non-Standard)

```bash
bun run build  # tsdown src/*.ts (all files, not just index.ts)
```

Exports 30+ utilities from 24 source files.

## Architecture Layers

### 1. Compressor Resolution
```ts
resolveCompressor(name)  // Built-in → npm → local file fallback
isBuiltInCompressor(name)
tryResolveBuiltIn/NpmPackage/LocalFile()
```

### 2. Compression Orchestration
```ts
run({ settings, content, index })  // Execute compressor, write output
compressSingleFile(settings)       // Entry point, routes by content type
```

### 3. File Operations (Dual Sync/Async)
```ts
readFile() / readFileAsync()           // Overloaded for string/Buffer
writeFile() / writeFileAsync()         // Array-aware with index
getContentFromFiles() / Async()        // Parallel file concatenation
deleteFile(), isValidFile(), isImageFile()
```

### 4. Content Normalization
```ts
ensureStringContent(content, compressorName)  // Buffer→string, validates
```

### 5. Utilities
```ts
// Size metrics
getFilesizeInBytes(), getFilesizeGzippedInBytes(), getFilesizeBrotliInBytes()
prettyBytes()

// Glob
wildcards(input, options)  // fast-glob with DEFAULT_IGNORES

// Source maps
extractSourceMapOption(), getSourceMapBoolean()

// CLI
buildArgs(options)  // Options object → CLI args array

// Deprecation
warnDeprecation(packageName, message)  // One-time per process

// Errors
wrapMinificationError(), validateMinifyResult()
```

## Key Exports by Usage

**High (10+ packages)**:
- `ensureStringContent` — All compressors
- `resolveCompressor` — core, cli, action, benchmark
- `wrapMinificationError` — 8+ compressors

**Medium (5-9 packages)**:
- `getFilesizeGzippedRaw`, `prettyBytes` — action, benchmark
- `buildArgs`, `wildcards` — core, cli

## Patterns

### Error Handling
```ts
import { FileOperationError, ValidationError } from "@node-minify/utils";
// All file ops throw FileOperationError with cause chaining
```

### Type-Safe Overloads
```ts
function readFile(path: string): string;
function readFile(path: string, asBuffer: true): Buffer;
```

### Deprecation (One-Time)
```ts
const warned = new Set<string>();
export function warnDeprecation(pkg: string, msg: string) {
    if (warned.has(pkg)) return;
    warned.add(pkg);
    console.warn(`[${pkg}] Deprecated: ${msg}`);
}
```

## Anti-Patterns

- **Never** use sync variants in hot paths (use async)
- **Never** mix image/text files in `getContentFromFiles()`
- **Never** bypass `ensureStringContent()` in compressors
- **Never** throw raw errors — wrap with `wrapMinificationError()`
