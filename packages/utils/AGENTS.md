# packages/utils/AGENTS.md

Cross-cutting utilities shared by all packages. Standard single-entry build (`tsdown src/index.ts`): the exports map only exposes `.`, so a new utility must be exported from `src/index.ts` to be reachable.

Exports 30+ utilities from the source files under `src/`.

## Architecture Layers

### 1. Compressor Registry & Resolution
`COMPRESSOR_REGISTRY` (`compressor-registry.ts`) is the single compressor list: name, status, packageName, exportName, cssOnly, aliases, replacement. The CLI, Action, resolver, benchmark and `doctor` read from it. To add, retire or rename a compressor, edit that one entry. `CompressorName` (non-removed names) is derived from it.
```ts
resolveCompressor(name)  // Removed check, then built-in → npm → local file fallback
isBuiltInCompressor(name)
tryResolveBuiltIn/NpmPackage/LocalFile()  // @deprecated, removed in v12: use resolveCompressor
getCompressorEntry(name) // Matches name or packageName
```
`resolveCompressor` is the only place a removed compressor is rejected (`Compressor '<name>' was removed in v11. Use '<replacement>' instead.`).

### 2. Compression Orchestration
```ts
run({ settings, content, index })  // Execute compressor, write output
compressSingleFile(settings)       // Entry point, routes by content type
```

### 3. File Operations (Dual Sync/Async)
```ts
readFileAsync()                        // Overloaded for string/Buffer
writeFileAsync()                       // Array-aware with index
getContentFromFilesAsync()             // Parallel file concatenation
isValidFileAsync(), isImageFile()
// Sync readFile(), writeFile(), getContentFromFiles(), isValidFile() and deleteFile()
// are @deprecated, removed in v12 (see "Deprecated exports")
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
extractSourceMapOption()

// Errors
wrapMinificationError(name, error, context?)  // "<name> minification failed: <message>"; `cause` is the original error when it is an Error, otherwise undefined
FileOperationError, ValidationError             // classes, exported from the entry point
```

## Key Exports by Usage

**High (10+ packages)**:
- `ensureStringContent` — All compressors
- `resolveCompressor` — core, cli, action, benchmark
- `wrapMinificationError` — all 16 compressors except `no-compress` (no library to fail); each wraps its library call in `try`/`catch` and none builds the `<name> minification failed:` prefix by hand. Some inner messages still repeat the name (clean-css, csso and html-minifier throw `<name> failed: empty result`), so those read `<name> minification failed: <name> failed: …`

**Medium (5-9 packages)**:
- `getFilesizeGzippedRaw`, `prettyBytes` — action, benchmark
- `wildcards` — core, benchmark

## Patterns

### Error Handling
```ts
import { FileOperationError, ValidationError } from "@node-minify/utils";
// All file ops throw FileOperationError with cause chaining
```
Input-validation errors (array content from `ensureStringContent`, esbuild's missing `type`, the sharp and imagemin Buffer checks) are thrown before the `try` and stay unwrapped. Everything inside the `try` gets the `<name> minification failed:` format: errors the library throws, and the compressor's own checks on the library's result (for example terser's `empty result`, imagemin's `no output`).

### Type-Safe Overloads
```ts
function readFileAsync(path: string): Promise<string>;
function readFileAsync(path: string, asBuffer: true): Promise<Buffer>;
```

## Deprecated exports (removed in v12)

Each carries `@deprecated` JSDoc on its declaration, naming the replacement. They keep their 11.0.x behavior for all of v11: no new runtime warning, no signature change. Put the tag on every overload signature, or editors only flag the overload that has it. No new code uses them.

| Export | Use instead |
|--------|-------------|
| `readFile`, `writeFile`, `getContentFromFiles`, `isValidFile` | `readFileAsync`, `writeFileAsync`, `getContentFromFilesAsync`, `isValidFileAsync` |
| `deleteFile` | `fs.promises.unlink` |
| `getSourceMapBoolean` | `extractSourceMapOption` |
| `tryResolveBuiltIn`, `tryResolveNpmPackage`, `tryResolveLocalFile` | `resolveCompressor` |
| `getKnownExportName` | `getCompressorEntry(name)?.exportName`, with the canonical name (no alias resolution: `"gcc"` → `undefined`) |
| `isLocalPath` | none (`resolveCompressor` accepts local paths) |
| `validateMinifyResult` | none (`run` already validates every compressor's result) |
| `buildArgs`, `toBuildArgsOptions`, `BuildArgsOptions` | none |
| `warnDeprecation`, `resetDeprecationWarnings` | none |
| `WildcardOptions.publicFolder` (object form of `wildcards` options) | pass the public folder as a string |
| `WildcardOptions.ignore` | none |

Internal callers still using them (migrated in a separate cleanup): `isValidFile` in `getContentFromFiles.ts`, `getFilesizeGzippedInBytes.ts`, `getFilesizeBrotliInBytes.ts`; `validateMinifyResult` in cssnano, oxc and minify-html.

## Anti-Patterns

- **Never** use sync variants in hot paths (use async)
- **Never** mix image/text files in `getContentFromFilesAsync()`
- **Never** bypass `ensureStringContent()` in compressors
- **Never** throw raw errors — wrap with `wrapMinificationError()`
