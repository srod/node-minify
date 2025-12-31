# Integration Tests - Future Ideas

## Overview

This document captures ideas for expanding integration test coverage beyond the 103 tests implemented in Phase 1-6.

---

## High Value Ideas

| Idea | Description | Effort | Impact |
|------|-------------|--------|--------|
| **Cross-platform path tests** | Test Windows backslashes, UNC paths, drive letters. Currently only tested on macOS/Linux. | Medium | High |
| **Memory usage baseline** | Ensure large file processing doesn't leak memory. Track heap usage before/after. | Medium | High |

---

## Medium Value Ideas

| Idea | Description | Effort | Impact |
|------|-------------|--------|--------|
| **Symlink handling** | Verify symlinks resolve correctly, avoid infinite loops with circular symlinks. | Low | Medium |
| **Streaming/stdin input** | Test piping content via CLI stdin: `echo "code" \| node-minify -c terser`. | Medium | Medium |
| **Config file loading** | If `.node-minify.config.js` is ever supported, test config discovery. | Medium | Medium |
| **Watch mode simulation** | Test file change detection if `--watch` is ever added. | High | Medium |

---

## Lower Priority Ideas

| Idea | Description | Effort | Impact |
|------|-------------|--------|--------|
| **Snapshot testing** | Compare minified output against known-good snapshots for regression detection. | Medium | Low |
| **Benchmark suite** | Track performance regression across compressors over time. | High | Low |
| **Docker container test** | Ensure everything works in containerized CI environments. | Medium | Low |
| **ESM/CJS interop** | Test both `import` and `require()` styles work correctly. | Low | Low |
| **Network timeout handling** | For compressors that fetch remote resources (if any). | Low | Low |

---

## Quick Wins (Recommended Next)

These can be implemented quickly with high value:

### 1. Cross-platform Path Tests
- Windows backslash handling
- UNC paths, drive letters
- Relative vs absolute path edge cases

### 2. Memory Usage Baseline
- Process large files without memory leaks
- Track heap usage before/after compression

---

## Implementation Notes

### Test File Locations
```
tests/integration/
├── cli.integration.test.ts          # ✅ Done (18 tests)
├── workflow.integration.test.ts     # ✅ Done (15 tests)
├── error-scenarios.integration.test.ts  # ✅ Done (25 tests)
├── image.integration.test.ts        # ✅ Done (21 tests)
├── edge-cases.integration.test.ts   # ✅ Done (20 tests) - unicode, compression ratio
├── deprecated.integration.test.ts   # ✅ Done (4 tests) - smoke tests
├── platform.integration.test.ts     # 🆕 Planned - cross-platform
└── memory.integration.test.ts       # 🆕 Planned - performance
```

### CI Considerations
- Image tests require sharp native binaries
- Deprecated compressor tests may need Java (for YUI)
- Consider `test.skipIf()` for platform-specific tests

---

## Priority Ranking

1. **Cross-platform paths** - Important for Windows users
2. **Memory baseline** - Catch performance regressions
3. **Everything else** - As needed

---

## Open Questions

1. Do we need Windows CI runner for cross-platform tests?
2. What memory thresholds are reasonable for large files?
