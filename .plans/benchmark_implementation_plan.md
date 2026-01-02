# Implementation Plan - Benchmark Feature for node-minify

## Context
Add a benchmark feature to node-minify that allows comparing the performance of different compressors (execution time, final size, compression ratio) via the CLI.

## Architecture

### 1. New package `@node-minify/benchmark`
**Location:** `packages/benchmark/`

**Files to create:**
```
packages/benchmark/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── benchmark.ts             # Core benchmark logic
│   ├── metrics.ts               # Metrics calculation (size, time, gzip)
│   ├── reporters/
│   │   ├── console-reporter.ts  # Terminal display with colors
│   │   ├── json-reporter.ts     # JSON export
│   │   └── markdown-reporter.ts # Markdown export
│   └── types.ts                 # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

### 2. Extend existing CLI
**Location:** `packages/cli/` (to be identified in existing code)

**Modifications:**
- Add `benchmark` command to CLI
- Parse benchmark-specific arguments
- Integrate with new benchmark package

## Technical Specifications

### BenchmarkOptions Interface
```typescript
interface BenchmarkOptions {
  input: string | string[];           // Files to benchmark
  compressors?: string[];             // List of compressors to test (auto-detect if empty)
  iterations?: number;                // Number of iterations (default: 1)
  includeGzip?: boolean;              // Calculate gzip size
  includeBrotli?: boolean;            // Calculate brotli size
  format?: 'console' | 'json' | 'md'; // Output format
  output?: string;                    // Output file (optional)
  verbose?: boolean;                  // Verbose mode
  type?: 'js' | 'css' | 'html';      // Filter by type
  maxTime?: number;                   // Max time threshold (ms)
  minReduction?: number;              // Min reduction threshold (%)
}
```

### BenchmarkResult Interface
```typescript
interface CompressorResult {
  compressor: string;
  size: number;                // Size in bytes
  time: number;                // Time in ms
  reduction: number;           // Reduction percentage
  gzipSize?: number;          // Gzip size if requested
  brotliSize?: number;        // Brotli size if requested
  error?: string;             // Error if failed
}

interface BenchmarkResult {
  file: string;
  originalSize: number;
  timestamp: string;
  results: CompressorResult[];
  winner: {
    compression: string;      // Best compression
    performance: string;      // Fastest
    recommended: string;      // Best balance
  };
}
```

## Implementation Steps

### Phase 1: Benchmark Core
1. **Create `@node-minify/benchmark` package**
   - Initialize structure
   - Configure TypeScript
   - Add to monorepo (workspace)

2. **Implement `benchmark.ts`**
   - Function to detect available compressors
   - Function to execute a compressor and measure time
   - Function to calculate metrics (size, reduction)
   - Error handling per compressor

3. **Implement `metrics.ts`**
   - Calculate file sizes
   - Calculate gzip (use zlib)
   - Calculate brotli (use brotli)
   - Calculate percentages

### Phase 2: Reporters
4. **Implement `console-reporter.ts`**
   - Formatted table display in terminal
   - Use `chalk` for colors
   - Emojis for indicators (🏆, ⚡, 🐢)
   - Sort results

5. **Implement `json-reporter.ts`**
   - Formatted JSON export
   - Schema validation

6. **Implement `markdown-reporter.ts`**
   - Generate Markdown table
   - Metadata (date, file)

### Phase 3: CLI Integration
7. **Extend existing CLI**
   - Add `benchmark` command to commander/yargs
   - Parse specific options
   - Call benchmark package
   - Handle output (console vs file)

8. **Add examples**
   - Create `examples/benchmark.js`
   - Document use cases

### Phase 4: Tests & Documentation
9. **Unit tests**
   - Tests for `benchmark.ts`
   - Tests for each reporter
   - CLI integration tests
   - Use existing fixtures

10. **Documentation**
    - Benchmark package README
    - Update main documentation
    - CLI examples in docs/

## CLI Commands to Implement

```bash
# Basic
node-minify benchmark <input>

# Main options
--compressors, -c    Comma-separated list of compressors
--iterations, -i     Number of iterations (default: 1)
--format, -f         Format: console|json|md (default: console)
--output, -o         Output file

# Measurement options
--gzip              Include gzip size
--brotli            Include brotli size
--verbose, -v       Verbose mode

# Filters
--type, -t          File type: js|css|html
--max-time          Max time in ms
--min-reduction     Min reduction in %
```

## Dependencies to Add

```json
{
  "dependencies": {
    "chalk": "^5.3.0",        // Terminal colors
    "cli-table3": "^0.6.3",   // Formatted tables
    "glob": "^10.3.10"        // Pattern matching (if not already present)
  }
}
```

## Programmatic Usage Example

```typescript
import { benchmark } from '@node-minify/benchmark';

const results = await benchmark({
  input: 'src/**/*.js',
  compressors: ['terser', 'esbuild', 'uglify-js'],
  iterations: 3,
  includeGzip: true,
  format: 'json',
  output: 'benchmark-results.json'
});

console.log(results.winner.recommended);
```

## Key Considerations

1. **Compressor Detection**
   - Check if package is installed before testing
   - Gracefully handle missing compressors

2. **Performance**
   - For large files, benchmark can be slow
   - Add progress bar (optional)

3. **Consistency**
   - Use same base options for all compressors
   - Document config differences per compressor

4. **Compatibility**
   - Test with supported Node.js versions
   - Handle differences between compressors (some don't support everything)

## Deliverables

- [ ] Functional `@node-minify/benchmark` package
- [ ] Integrated `benchmark` CLI command
- [ ] 3 output formats (console, JSON, Markdown)
- [ ] Unit and integration tests
- [ ] Complete documentation
- [ ] Usage examples

## Future Extensions (out of initial scope)

- Watch mode for continuous benchmarking
- Historical comparison (evolution graphs)
- CI/CD integration with GitHub Actions
- REST API for remote benchmarking

## Expected Terminal Output Example

```
🔍 Benchmarking: input.js (45.2 KB)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Compressor      Size      Reduction   Time      Speed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
esbuild         12.3 KB   72.8%      45ms      ⚡ Fastest
terser          11.8 KB   73.9%      234ms     🐢 2.1x slower
swc             12.1 KB   73.2%      67ms      ⚡ 1.5x slower
uglify-js       11.9 KB   73.7%      456ms     🐢 4.1x slower
gcc             11.5 KB   74.6%      892ms     🐢 8.0x slower

🏆 Best compression: gcc (11.5 KB, 74.6%)
⚡ Best performance: esbuild (45ms)
💡 Recommended: terser (good balance)
```

## JSON Output Example

```json
{
  "file": "input.js",
  "original_size": 46284,
  "timestamp": "2026-01-02T10:30:00Z",
  "results": [
    {
      "compressor": "esbuild",
      "size": 12595,
      "reduction": 72.8,
      "time_ms": 45,
      "gzip_size": 4521
    },
    {
      "compressor": "terser",
      "size": 12083,
      "reduction": 73.9,
      "time_ms": 234,
      "gzip_size": 4401
    }
  ],
  "winner": {
    "compression": "gcc",
    "performance": "esbuild",
    "recommended": "terser"
  }
}
```

## Markdown Output Example

```markdown
# Benchmark Results

**File:** input.js (45.2 KB)  
**Date:** 2026-01-02T10:30:00Z

| Compressor | Size | Reduction | Time | Gzip |
|------------|------|-----------|------|------|
| esbuild    | 12.3 KB | 72.8% | 45ms | 4.5 KB |
| terser     | 11.8 KB | 73.9% | 234ms | 4.3 KB |
| swc        | 12.1 KB | 73.2% | 67ms | 4.4 KB |
| uglify-js  | 11.9 KB | 73.7% | 456ms | 4.4 KB |
| gcc        | 11.5 KB | 74.6% | 892ms | 4.2 KB |

## Summary

- 🏆 **Best compression:** gcc (11.5 KB, 74.6%)
- ⚡ **Best performance:** esbuild (45ms)
- 💡 **Recommended:** terser (good balance)
```

## Implementation Priority

### Must Have (MVP)
1. Core benchmark functionality
2. Console reporter with basic formatting
3. Support for at least 3 compressors (terser, esbuild, uglify-js)
4. CLI command integration
5. Basic documentation

### Should Have
1. JSON and Markdown reporters
2. Gzip size calculation
3. Multiple iterations support
4. Auto-detect installed compressors
5. Comprehensive tests

### Nice to Have
1. Brotli size calculation
2. Progress indicators
3. Filtering options (type, thresholds)
4. Verbose mode
5. Historical comparison

## Technical Decisions

### Why separate package?
- Keeps benchmark logic isolated
- Can be used programmatically outside CLI
- Easier to test independently
- Optional dependency for users who don't need it

### Why these reporters?
- **Console:** Default for quick feedback
- **JSON:** Machine-readable for CI/CD pipelines
- **Markdown:** Documentation and reports

### Why chalk and cli-table3?
- Industry standard for CLI formatting
- Widely used and maintained
- Already used in similar tools
- Good TypeScript support