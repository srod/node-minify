## 2024-02-14 - Unbounded Buffer in Child Process Execution
**Vulnerability:** The `packages/run` utility accumulated `stdout` and `stderr` from child processes into unbounded strings, creating a Denial of Service (DoS) risk via memory exhaustion.
**Learning:** `child_process.spawn` does not have a built-in `maxBuffer` option like `exec` does; it must be implemented manually on the streams.
**Prevention:** Implement manual buffer size checks in `data` event listeners for `spawn`ed processes and kill the process if the limit is exceeded.
