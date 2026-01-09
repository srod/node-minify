## 2024-03-24 - [Information Leakage via Error Logging]
**Vulnerability:** The `packages/run` library was indiscriminately logging `stderr` and stream errors to `console.error`. This could leak sensitive information (file paths, stack traces, environment details) if a child process failed or printed sensitive data to stderr.
**Learning:** Libraries should not side-effect to global loggers (`console`) unless explicitly configured. Error handling should propagate errors to the caller (via Promise rejection) rather than logging them directly.
**Prevention:**
1. Avoid `console.log` or `console.error` in library code.
2. Ensure stream error handlers are present (to prevent `Unhandled 'error' event` crashes) but do not log unless necessary.
3. Use structured error objects to pass context back to the caller.
