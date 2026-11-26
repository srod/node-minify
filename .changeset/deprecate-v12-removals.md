---
"@node-minify/utils": minor
"@node-minify/types": minor
---

Every export that v12 removes is now marked `@deprecated`, and editors show it struck through. All of them keep working exactly as in 11.0.x through v11, and none of them emits a new deprecation warning at runtime.

| Package | Deprecated export | Use instead |
|---|---|---|
| `@node-minify/utils` | `readFile` (every overload) | `readFileAsync` |
| `@node-minify/utils` | `writeFile` | `writeFileAsync` |
| `@node-minify/utils` | `getContentFromFiles` | `getContentFromFilesAsync` |
| `@node-minify/utils` | `isValidFile` | `isValidFileAsync` |
| `@node-minify/utils` | `deleteFile` | `fs.promises.unlink` |
| `@node-minify/utils` | `getSourceMapBoolean` | `extractSourceMapOption` |
| `@node-minify/utils` | `tryResolveBuiltIn`, `tryResolveNpmPackage`, `tryResolveLocalFile` | `resolveCompressor` |
| `@node-minify/utils` | `getKnownExportName` | `getCompressorEntry(name)?.exportName`, with the canonical name: `getCompressorEntry` does not resolve aliases, so `"gcc"` returns `undefined` and needs `"google-closure-compiler"` |
| `@node-minify/utils` | `isLocalPath` | none (`resolveCompressor` accepts local paths) |
| `@node-minify/utils` | `validateMinifyResult` | none (`run` already validates every compressor's result) |
| `@node-minify/utils` | `buildArgs`, `toBuildArgsOptions`, `BuildArgsOptions` | none |
| `@node-minify/utils` | `warnDeprecation`, `resetDeprecationWarnings` | none |
| `@node-minify/utils` | `WildcardOptions` (the type of the object form of the `wildcards` second argument) | none (pass the public folder as a string) |
| `@node-minify/utils` | `WildcardOptions.publicFolder` | pass the public folder as a string: `wildcards(input, publicFolder)` |
| `@node-minify/utils` | `WildcardOptions.ignore` | none |
| `@node-minify/types` | `ImageFormat` | none |
| `@node-minify/types` | `Settings.option` (the CLI's raw `-O` string) | `options` (v12 moves the field to the CLI's own type) |

`wildcards` itself is not deprecated, only its object form. These exports are removed in v12.
